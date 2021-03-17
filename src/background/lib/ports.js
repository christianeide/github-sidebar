let index = 0;
const ports = {};

// TODO: Change to an object instead of multiple exports?
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

// TOdo: Trengs denne egentlig? Eller baree bruke messageAll?
export function sendToAllTabs(data) {
	messageAll(data);
}
