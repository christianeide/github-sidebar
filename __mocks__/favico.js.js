const mockReset = jest.fn();
const mockBadge = jest.fn();

const favicon = jest.fn(() => {
	return {
		reset: mockReset,
		badge: mockBadge,
	};
});

export default favicon;
