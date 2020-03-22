import { h } from 'preact'
// TODO: Can theese two imports be done globally?
import '@testing-library/jest-dom';
import '@testing-library/jest-dom/extend-expect'
import { render } from '@testing-library/preact'
import App from '../main.jsx';

describe('errorBoundary', () => {
	it('should render children if everything is ok!', () => {
		const { container } = render(
			<App />
		);

		expect(container).toMatchSnapshot();
	});
});
