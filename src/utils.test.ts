import { describe, expect, it } from 'vitest';
import { formatCurrency, indexToLabel, monthLabels } from './utils';

describe('monthLabels', () => {
	it('has 12 entries', () => {
		expect(monthLabels).toHaveLength(12);
	});

	it('starts with Jan and ends with Dec', () => {
		expect(monthLabels[0]).toBe('Jan');
		expect(monthLabels[11]).toBe('Dec');
	});
});

describe('formatCurrency', () => {
	it('formats zero', () => {
		expect(formatCurrency(0)).toBe('0 €');
	});

	it('formats small numbers without separators', () => {
		expect(formatCurrency(42)).toBe('42 €');
		expect(formatCurrency(999)).toBe('999 €');
	});

	it('formats thousands with apostrophe separator', () => {
		expect(formatCurrency(1000)).toBe("1'000 €");
		expect(formatCurrency(12345)).toBe("12'345 €");
	});

	it('formats millions with multiple separators', () => {
		expect(formatCurrency(1234567)).toBe("1'234'567 €");
	});

	it('rounds decimals', () => {
		expect(formatCurrency(1234.56)).toBe("1'235 €");
		expect(formatCurrency(99.4)).toBe('99 €');
	});

	it('formats negative numbers', () => {
		expect(formatCurrency(-5000)).toBe("-5'000 €");
	});
});

describe('indexToLabel', () => {
	it('maps index to correct month label', () => {
		expect([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13].map(indexToLabel)).toStrictEqual([
			'Dec',
			'Jan',
			'Feb',
			'Mar',
			'Apr',
			'May',
			'Jun',
			'Jul',
			'Aug',
			'Sep',
			'Oct',
			'Nov',
			'Dec',
			'Jan',
		]);
	});
});
