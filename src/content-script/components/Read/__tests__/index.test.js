import { h } from 'preact';
import { render, fireEvent } from '@testing-library/preact';
import Read from '../index.jsx';

const title = 'This is a nice title';
const status = 'APPROVED';
const toggleRead = jest.fn();

describe('Read', () => {
	it('should render defaultprops if none are supplied!', () => {
		const { container } = render(<Read />);

		expect(container).toMatchSnapshot();
	});

	it('should render props if they are supplied', () => {
		const { container } = render(
			<Read read={true} title={title} status={status} />
		);

		expect(container).toMatchSnapshot();
	});

	it('should set read title if no title is supplied', () => {
		const { getByTitle } = render(<Read read={true} status={status} />);

		expect(getByTitle('Mark as read')).toBeTruthy();
	});

	it('should handle clickevent', () => {
		const { getByTitle } = render(
			<Read toggleRead={toggleRead} title={title} />
		);

		fireEvent.click(getByTitle(title));

		expect(toggleRead).toHaveBeenCalledTimes(1);
	});
});
