// import { h } from 'preact';
// import { render, fireEvent } from '@testing-library/preact';
// import Header from '../index.jsx';

// const title = 'This is a nice title';
// const status = 'APPROVED';
// const toggleRead = jest.fn();
// const errors = [{ title: 'Error', message: 'Errormessage' }];

describe('Read', () => {
	it('should show loadingbars if data is loading!', () => {
		// const { container, getByText } = render(<Header loading={true} />);
		// expect(container).toMatchSnapshot();
		// expect(getByText('Github Sidebar')).toBeInTheDocument();
	});

	// it('should render the component with all props', () => {
	// 	const { container } = render(
	// 		<Header loading={true} errors={errors} showSettings={false} />
	// 	);

	// // 	expect(container).toMatchSnapshot();
	// });

	// it('should set read title if no title is supplied', () => {
	// 	const { getByTitle } = render(<Header read={true} status={status} />);

	// 	expect(getByTitle('Mark as read')).toBeTruthy();
	// });

	// it('should handle toggle settings', () => {
	// 	const { getByTitle, getByRole, getByAltText } = render(
	// 		<Header onClick={toggleRead} title={title} />
	// 	);

	// 	fireEvent.click(getByRole('svg'));

	// 	expect(toggleRead).toHaveBeenCalledTimes(1);
	// });
});
