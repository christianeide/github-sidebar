let index = 0;
const ports = {};

export function add(port) {
	const id = index;
	ports[id] = port;

	port.onDisconnect.addListener(() => {
		remove(id);
	});

	index++;
}
export function remove(id) {
	delete ports[id];
}
export function messageAll(message) {
	for (const id in ports) {
		ports[id].postMessage(message);
	}
}
