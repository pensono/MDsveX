import type { Processor } from 'unified';
import type { Plugin } from 'unified';
import type { VFileMessage } from 'vfile-message';
import type { VFileContents } from 'vfile';

import { join } from 'path';
import fs from 'fs';
import { parse } from 'svelte/compiler';
import unified from 'unified';
import markdown from 'remark-parse';
import external from 'remark-external-links';
import extract_frontmatter from 'remark-frontmatter';
import remark2rehype from 'remark-rehype';
import hast_to_html from '@starptech/prettyhtml-hast-to-html';

import { mdsvex_parser } from './parsers';
import {
	default_frontmatter,
	parse_frontmatter,
	escape_code,
	transform_hast,
	smartypants_transformer,
	highlight_blocks,
	code_highlight,
} from './transformers';

function stringify(options = {}) {
	this.Compiler = compiler;

	function compiler(tree) {
		return hast_to_html(tree, options);
	}
}

const apply_plugins = (plugins: Plugin[], parser: Processor) => {
	plugins.forEach((plugin) => {
		if (Array.isArray(plugin)) {
			if (plugin[1]) parser.use(plugin[0], plugin[1]);
			else parser.use(plugin[0]);
		} else {
			parser.use(plugin);
		}
	});

	return parser;
};

type frontmatter_options = {
	parse: (
		fm: string,
		messages: VFileMessage[]
	) => undefined | Record<string, unknown>;
	type: string;
	marker: string;
};

type smartypants_options =
	| boolean
	| {
			quotes: boolean;
			ellipses: boolean;
			backticks: boolean | 'all';
			dashes: boolean | 'oldschool' | 'inverted';
	  };

type layout = { [x: string]: { path: string; components?: string } };

type highlight = {
	highlighter: (code: string, lang: string | undefined) => string;
};

type transformer_options = {
	remarkPlugins?: Plugin[];
	rehypePlugins?: Plugin[];
	frontmatter?: frontmatter_options;
	smartypants?: smartypants_options;
	layout?: layout;
	highlight?: highlight;
};

export function transform({
	remarkPlugins = [],
	rehypePlugins = [],
	frontmatter,
	smartypants,
	layout,
	highlight,
}: transformer_options = {}): Processor {
	const fm_opts = frontmatter
		? frontmatter
		: { parse: default_frontmatter, type: 'yaml', marker: '-' };
	const toMDAST = unified()
		.use(markdown)
		.use(mdsvex_parser)
		.use(external, { target: false, rel: ['nofollow'] })
		.use(escape_code, { blocks: !!highlight })
		.use(extract_frontmatter, [{ type: fm_opts.type, marker: fm_opts.marker }])
		.use(parse_frontmatter, { parse: fm_opts.parse, type: fm_opts.type })
		.use(highlight_blocks, highlight);

	if (smartypants) {
		toMDAST.use(
			smartypants_transformer,
			typeof smartypants === 'boolean' ? {} : smartypants
		);
	}

	apply_plugins(remarkPlugins, toMDAST);

	const toHAST = toMDAST
		.use(remark2rehype, {
			allowDangerousHtml: true,
			allowDangerousCharacters: true,
		})
		.use(transform_hast, { layout });

	apply_plugins(rehypePlugins, toHAST);

	const processor = toHAST.use(stringify, {
		allowDangerousHtml: true,
		allowDangerousCharacters: true,
	});

	return processor;
}

const defaults = {
	remarkPlugins: [],
	rehypePlugins: [],
	smartypants: true,
	extension: '.svx',
	layout: false,
	highlight: { highlighter: code_highlight },
};

function to_posix(_path) {
	const isExtendedLengthPath = /^\\\\\?\\/.test(_path);
	const hasNonAscii = /[^\u0000-\u0080]+/.test(_path); // eslint-disable-line no-control-regex

	if (isExtendedLengthPath || hasNonAscii) {
		return _path;
	}

	return _path.replace(/\\/g, '/');
}

function resolve_layout(layout_path) {
	try {
		return to_posix(require.resolve(layout_path));
	} catch (e) {
		try {
			const _path = join(process.cwd(), layout_path);
			return to_posix(require.resolve(_path));
		} catch (e) {
			throw new Error(
				`The layout path you provided couldn't be found at either ${layout_path} or ${join(
					process.cwd(),
					layout_path
				)}. Please double-check it and try again.`
			);
		}
	}
}

// handle custom components

function process_layouts(layouts) {
	const _layouts = layouts;

	for (const key in _layouts) {
		const layout = fs.readFileSync(_layouts[key].path, { encoding: 'utf8' });
		const ast = parse(layout);

		if (ast.module) {
			const component_exports = ast.module.content.body.filter(
				(node) => node.type === 'ExportNamedDeclaration'
			);

			if (component_exports.length) {
				_layouts[key].components = [];

				for (let i = 0; i < component_exports.length; i++) {
					if (
						component_exports[i].specifiers &&
						component_exports[i].specifiers.length
					) {
						for (let j = 0; j < component_exports[i].specifiers.length; j++) {
							_layouts[key].components.push(
								component_exports[i].specifiers[j].exported.name
							);
						}
					} else if (component_exports[i].declaration.declarations) {
						const declarations = component_exports[i].declaration.declarations;

						for (let j = 0; j < declarations.length; j++) {
							_layouts[key].components.push(declarations[j].id.name);
						}
					} else if (component_exports[i].declaration) {
						_layouts[key].components.push(
							component_exports[i].declaration.id.name
						);
					}
				}
			}
		}
	}
	return _layouts;
}

type mdsvex_options = {
	remarkPlugins?: Plugin[];
	rehypePlugins?: Plugin[];
	frontmatter?: frontmatter_options;
	smartypants?: smartypants_options;
	highlight?: highlight;
	extension?: string;
	layout: string | layout | boolean;
};

type preprocessor_return =
	| { code: VFileContents; map?: string }
	| Promise<{ code: VFileContents; map?: string }>;

type preprocessor = {
	markup: (args: { content: string; filename: string }) => preprocessor_return;
};

export const mdsvex = (options: mdsvex_options = defaults): preprocessor => {
	const {
		remarkPlugins = [],
		rehypePlugins = [],
		smartypants = true,
		extension = '.svx',
		layout = false,
		highlight = { highlighter: code_highlight },
		frontmatter,
	} = options;

	//@ts-ignore
	if (options.layouts) {
		throw new Error(
			`mdsvex: "layouts" is not a valid option. Did you mean "layout"?`
		);
	}

	const unknown_opts = [];
	const known_opts = [
		'remarkPlugins',
		'rehypePlugins',
		'smartypants',
		'extension',
		'layout',
		'highlight',
		'frontmatter',
	];

	for (const opt in options) {
		if (!known_opts.includes(opt)) unknown_opts.push(opt);
	}

	if (unknown_opts.length) {
		console.warn(
			`mdsvex: Received unknown options: ${unknown_opts.join(
				', '
			)}. Valid options are: ${known_opts.join(', ')}.`
		);
	}

	let _layout: layout =
		typeof layout === 'boolean' || typeof layout === 'string' ? {} : layout;

	if (typeof layout === 'string') {
		_layout.__mdsvex_default = { path: resolve_layout(layout) };
	} else if (typeof layout === 'object') {
		for (const name in layout) {
			_layout[name] = { path: resolve_layout(layout[name]) };
		}
	}
	if (highlight && highlight.highlighter === undefined) {
		highlight.highlighter = code_highlight;
	}

	_layout = process_layouts(_layout);

	const parser = transform({
		remarkPlugins,
		rehypePlugins,
		smartypants,
		layout: _layout,
		highlight,
		frontmatter,
	});

	return {
		markup: async ({ content, filename }) => {
			if (filename.split('.').pop() !== extension.split('.').pop()) return;

			const parsed = await parser.process({ contents: content, filename });
			return { code: parsed.contents };
		},
	};
};

const _compile = (
	source: string,
	opts: mdsvex_options & { filename: string }
): preprocessor_return =>
	mdsvex(opts).markup({
		content: source,
		filename:
			(opts && opts.filename) || `file${(opts && opts.extension) || '.svx'}`,
	});

export { _compile as compile };