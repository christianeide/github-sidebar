import { add, remove, messageAll, sendToAllTabs } from '../index';
import { createChromePort } from '../../../../test/generate.js';

const port = createChromePort();
const message = 'This is my message!';

describe('ports', () => {
	it('should add port', () => {
		// Add two ports
		add(port);
		add(port);

		messageAll(message);

		expect(port.postMessage).toHaveBeenCalledTimes(2);
		expect(port.postMessage).toHaveBeenCalledWith(message);
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
		expect(port.postMessage).toHaveBeenCalledTimes(1);
		expect(port.postMessage).toHaveBeenCalledWith(message);
	});

	it('should send to all tabs', () => {
		// Remove any previous added elemeents from other tests
		remove('0');
		remove('1');

		// Add two ports
		add(port);
		add(port);

		sendToAllTabs(message);
		expect(port.postMessage).toHaveBeenCalledTimes(3);
		expect(port.postMessage).toHaveBeenCalledWith(message);
	});
});
