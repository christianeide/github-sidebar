import { add, remove, messageAll } from '../ports.js';

const postMessage = jest.fn();
const port = {
	name: 'port_name',
	onDisconnect: { addListener: jest.fn() },
	onMessage: {
		addListener: jest.fn(),
	},
	postMessage,
};
const message = 'This is my message!';

describe('ports', () => {
	it('should add port', () => {
		// Add two ports
		add(port);
		add(port);

		messageAll(message);

		expect(postMessage).toHaveBeenCalledTimes(2);
		expect(postMessage).toHaveBeenCalledWith(message);
	});

	it('should remove port on onDisconnect', () => {
		// Remove any previous added elemeents from other tests
		remove('0');
		remove('1');

		// Add two ports
		add(port);
		add(port);

		// Let one item disconnect
		const callOnDisconnect = port.onDisconnect.addListener.mock.calls[0][0];
		callOnDisconnect();

		messageAll(message);
		expect(postMessage).toHaveBeenCalledTimes(1);
		expect(postMessage).toHaveBeenCalledWith(message);
	});
});
