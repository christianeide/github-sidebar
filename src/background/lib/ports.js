export const ports = {
	_index: 0,
	_ports: {},
	add(port) {
		const id = this._index;
		this._ports[id] = port;

		port.onDisconnect.addListener(() => {
			this.remove(id);
		});

		this._index++;
	},
	remove(id) {
		delete this._ports[id];
	},
	sendToAllTabs(message) {
		for (const id in this._ports) {
			this._ports[id].postMessage(message);
		}
	},
};
