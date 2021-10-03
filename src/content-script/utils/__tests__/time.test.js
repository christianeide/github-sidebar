import { ago, until } from '../time';

beforeAll(() => {
	jest.useFakeTimers('modern');
	jest.setSystemTime(new Date('2021-02-01T12:00:00Z'));
});

afterAll(() => {
	jest.useRealTimers();
});

describe('ago (and until)', () => {
	it('should return seconds in plural', () => {
		let agoTest = ago('2021-02-01T11:59:30Z');

		expect(agoTest).toBe('30 seconds');
	});

	it('should return unit in singular', () => {
		let agoTest = ago('2021-02-01T11:59:59Z');

		expect(agoTest).toBe('1 second');
	});

	it('should return minutes', () => {
		let agoTest = ago('2021-02-01T11:57:30Z');

		expect(agoTest).toBe('2 minutes');
	});

	it('should return hours', () => {
		let agoTest = ago('2021-02-01T09:38:00Z');

		expect(agoTest).toBe('2 hours');
	});

	it('should return days', () => {
		let agoTest = ago('2021-01-30T09:38:00Z');

		expect(agoTest).toBe('2 days');
	});

	it('should return weeks', () => {
		let agoTest = ago('2021-01-20T09:38:00Z');

		expect(agoTest).toBe('1 week');
	});

	it('should return months', () => {
		let agoTest = ago('2020-10-20T09:38:00Z');

		expect(agoTest).toBe('3 months');
	});

	it('should return years', () => {
		let agoTest = ago('2018-10-20T09:38:00Z');

		expect(agoTest).toBe('2 years');
	});

	it('should handle missing time', () => {
		let agoTest = ago();

		expect(agoTest).toBe('0 seconds');
	});

	it('should return 0 if time has passed', () => {
		let agoTest = ago('2021-02-02T12:00:00Z');

		expect(agoTest).toBe('0 minutes');
	});
});

// Ago and until shares the same logic, we only need to check that
// until works, all oth
describe('until', () => {
	it('should return time until', () => {
		let agoTest = until('2021-02-01T12:00:30Z');

		expect(agoTest).toBe('30 seconds');
	});
});
