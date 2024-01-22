let source;

function check() {
	if (typeof module === 'undefined') return;

	if (module.hot.status() === 'idle') {
		module.hot.check(true).then(modules => {
			console.log(`[SAPPER] applied HMR update`);
		});
	}
}

function connect(port) {
	if (source || !window.EventSource) return;

	source = new EventSource(`http://${window.location.hostname}:${port}/__sapper__`);

	window.source = source;

	source.onopen = function(event) {
		console.log(`[SAPPER] dev client connected`);
	};

	source.onerror = function(error) {
		console.error(error);
	};

	source.onmessage = function(event) {
		const data = JSON.parse(event.data);
		if (!data) return; // just a heartbeat

		if (data.action === 'reload') {
			window.location.reload();
		}

		if (data.status === 'completed') {
			check();
		}
	};

	// Close the event source before the window is unloaded to prevent an error
	// ("The connection was interrupted while the page was loading.") in Firefox
	// when the page is reloaded.
	window.addEventListener('beforeunload', function() {
		source.close();
	});
}

export { connect };
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2FwcGVyLWRldi1jbGllbnQtNmFmMmE5MGEuanMiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL25vZGVfbW9kdWxlcy8ucG5wbS9zYXBwZXJAMC4yOS4zX3N2ZWx0ZUA0LjAuMC9ub2RlX21vZHVsZXMvc2FwcGVyL3NhcHBlci1kZXYtY2xpZW50LmpzIl0sInNvdXJjZXNDb250ZW50IjpbImxldCBzb3VyY2U7XG5cbmZ1bmN0aW9uIGNoZWNrKCkge1xuXHRpZiAodHlwZW9mIG1vZHVsZSA9PT0gJ3VuZGVmaW5lZCcpIHJldHVybjtcblxuXHRpZiAobW9kdWxlLmhvdC5zdGF0dXMoKSA9PT0gJ2lkbGUnKSB7XG5cdFx0bW9kdWxlLmhvdC5jaGVjayh0cnVlKS50aGVuKG1vZHVsZXMgPT4ge1xuXHRcdFx0Y29uc29sZS5sb2coYFtTQVBQRVJdIGFwcGxpZWQgSE1SIHVwZGF0ZWApO1xuXHRcdH0pO1xuXHR9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBjb25uZWN0KHBvcnQpIHtcblx0aWYgKHNvdXJjZSB8fCAhd2luZG93LkV2ZW50U291cmNlKSByZXR1cm47XG5cblx0c291cmNlID0gbmV3IEV2ZW50U291cmNlKGBodHRwOi8vJHt3aW5kb3cubG9jYXRpb24uaG9zdG5hbWV9OiR7cG9ydH0vX19zYXBwZXJfX2ApO1xuXG5cdHdpbmRvdy5zb3VyY2UgPSBzb3VyY2U7XG5cblx0c291cmNlLm9ub3BlbiA9IGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0Y29uc29sZS5sb2coYFtTQVBQRVJdIGRldiBjbGllbnQgY29ubmVjdGVkYCk7XG5cdH07XG5cblx0c291cmNlLm9uZXJyb3IgPSBmdW5jdGlvbihlcnJvcikge1xuXHRcdGNvbnNvbGUuZXJyb3IoZXJyb3IpO1xuXHR9O1xuXG5cdHNvdXJjZS5vbm1lc3NhZ2UgPSBmdW5jdGlvbihldmVudCkge1xuXHRcdGNvbnN0IGRhdGEgPSBKU09OLnBhcnNlKGV2ZW50LmRhdGEpO1xuXHRcdGlmICghZGF0YSkgcmV0dXJuOyAvLyBqdXN0IGEgaGVhcnRiZWF0XG5cblx0XHRpZiAoZGF0YS5hY3Rpb24gPT09ICdyZWxvYWQnKSB7XG5cdFx0XHR3aW5kb3cubG9jYXRpb24ucmVsb2FkKCk7XG5cdFx0fVxuXG5cdFx0aWYgKGRhdGEuc3RhdHVzID09PSAnY29tcGxldGVkJykge1xuXHRcdFx0Y2hlY2soKTtcblx0XHR9XG5cdH07XG5cblx0Ly8gQ2xvc2UgdGhlIGV2ZW50IHNvdXJjZSBiZWZvcmUgdGhlIHdpbmRvdyBpcyB1bmxvYWRlZCB0byBwcmV2ZW50IGFuIGVycm9yXG5cdC8vIChcIlRoZSBjb25uZWN0aW9uIHdhcyBpbnRlcnJ1cHRlZCB3aGlsZSB0aGUgcGFnZSB3YXMgbG9hZGluZy5cIikgaW4gRmlyZWZveFxuXHQvLyB3aGVuIHRoZSBwYWdlIGlzIHJlbG9hZGVkLlxuXHR3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lcignYmVmb3JldW5sb2FkJywgZnVuY3Rpb24oKSB7XG5cdFx0c291cmNlLmNsb3NlKCk7XG5cdH0pO1xufVxuIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLElBQUksTUFBTSxDQUFDO0FBQ1g7QUFDQSxTQUFTLEtBQUssR0FBRztBQUNqQixDQUFDLElBQUksT0FBTyxNQUFNLEtBQUssV0FBVyxFQUFFLE9BQU87QUFDM0M7QUFDQSxDQUFDLElBQUksTUFBTSxDQUFDLEdBQUcsQ0FBQyxNQUFNLEVBQUUsS0FBSyxNQUFNLEVBQUU7QUFDckMsRUFBRSxNQUFNLENBQUMsR0FBRyxDQUFDLEtBQUssQ0FBQyxJQUFJLENBQUMsQ0FBQyxJQUFJLENBQUMsT0FBTyxJQUFJO0FBQ3pDLEdBQUcsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLDJCQUEyQixDQUFDLENBQUMsQ0FBQztBQUM5QyxHQUFHLENBQUMsQ0FBQztBQUNMLEVBQUU7QUFDRixDQUFDO0FBQ0Q7QUFDTyxTQUFTLE9BQU8sQ0FBQyxJQUFJLEVBQUU7QUFDOUIsQ0FBQyxJQUFJLE1BQU0sSUFBSSxDQUFDLE1BQU0sQ0FBQyxXQUFXLEVBQUUsT0FBTztBQUMzQztBQUNBLENBQUMsTUFBTSxHQUFHLElBQUksV0FBVyxDQUFDLENBQUMsT0FBTyxFQUFFLE1BQU0sQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDLENBQUMsQ0FBQztBQUNuRjtBQUNBLENBQUMsTUFBTSxDQUFDLE1BQU0sR0FBRyxNQUFNLENBQUM7QUFDeEI7QUFDQSxDQUFDLE1BQU0sQ0FBQyxNQUFNLEdBQUcsU0FBUyxLQUFLLEVBQUU7QUFDakMsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLENBQUMsNkJBQTZCLENBQUMsQ0FBQyxDQUFDO0FBQy9DLEVBQUUsQ0FBQztBQUNIO0FBQ0EsQ0FBQyxNQUFNLENBQUMsT0FBTyxHQUFHLFNBQVMsS0FBSyxFQUFFO0FBQ2xDLEVBQUUsT0FBTyxDQUFDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztBQUN2QixFQUFFLENBQUM7QUFDSDtBQUNBLENBQUMsTUFBTSxDQUFDLFNBQVMsR0FBRyxTQUFTLEtBQUssRUFBRTtBQUNwQyxFQUFFLE1BQU0sSUFBSSxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDO0FBQ3RDLEVBQUUsSUFBSSxDQUFDLElBQUksRUFBRSxPQUFPO0FBQ3BCO0FBQ0EsRUFBRSxJQUFJLElBQUksQ0FBQyxNQUFNLEtBQUssUUFBUSxFQUFFO0FBQ2hDLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxNQUFNLEVBQUUsQ0FBQztBQUM1QixHQUFHO0FBQ0g7QUFDQSxFQUFFLElBQUksSUFBSSxDQUFDLE1BQU0sS0FBSyxXQUFXLEVBQUU7QUFDbkMsR0FBRyxLQUFLLEVBQUUsQ0FBQztBQUNYLEdBQUc7QUFDSCxFQUFFLENBQUM7QUFDSDtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUMsTUFBTSxDQUFDLGdCQUFnQixDQUFDLGNBQWMsRUFBRSxXQUFXO0FBQ3BELEVBQUUsTUFBTSxDQUFDLEtBQUssRUFBRSxDQUFDO0FBQ2pCLEVBQUUsQ0FBQyxDQUFDO0FBQ0o7Ozs7In0=