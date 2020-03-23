import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect';

// Mock chrome
delete global.window.chrome;
global.window = Object.create(window);
global.window.chrome = {
	runtime: {
		connect: jest.fn(() => {
			return {
				postMessage: jest.fn(),
				onMessage: {
					addListener: jest.fn(),
				},
			};
		}),
	},
};
