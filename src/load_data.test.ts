import { describe, expect, it, vi } from 'vitest';
import type * as d3 from 'd3';

/** Helper to build a mock DSVRowArray from plain objects. */
function mockTsvData(rows: Record<string, string>[]): d3.DSVRowArray<string> {
	const result = rows as unknown as d3.DSVRowArray<string>;
	result.columns = Object.keys(rows[0] ?? {});
	return result;
}

const mockTsv = vi.fn();
vi.mock('d3', () => ({ tsv: mockTsv }));

const { loadData, processEntries } = await import('./load_data');

const sampleRows = [
	{ month: '2025-01', donors: '5', needed: '1000', pledged: '200', received: '600' },
	{ month: '2025-02', donors: '3', needed: '1000', pledged: '0', received: '800' },
	{ month: '2025-03', donors: '4', needed: '1000', pledged: '100', received: '900' },
];

describe('loadData', () => {
	it('parses entries and computes donated = pledged + received', async () => {
		mockTsv.mockResolvedValue(mockTsvData(sampleRows));

		const entries = await loadData('test.tsv');

		expect(entries[0].pledged).toBe(200);
		expect(entries[0].received).toBe(600);
		expect(entries[0].donated).toBe(800);
	});

	it('parses year from month field', async () => {
		mockTsv.mockResolvedValue(mockTsvData(sampleRows));

		const entries = await loadData('test.tsv');

		expect(entries[0].year).toBe(2025);
		expect(entries[1].year).toBe(2025);
	});

	it('sorts entries chronologically', async () => {
		const reversed = [...sampleRows].reverse();
		mockTsv.mockResolvedValue(mockTsvData(reversed));
		const entries = await loadData('test.tsv');
		expect(entries.map((e) => e.index)).toEqual([301, 302, 303]);
	});

	it('shows year only for January indexs', async () => {
		mockTsv.mockResolvedValue(mockTsvData(sampleRows));
		const entries = await loadData('test.tsv');
		expect(entries.map((e) => e.index)).toEqual([301, 302, 303]);
	});

	it('does not compute cumulative sums', async () => {
		mockTsv.mockResolvedValue(mockTsvData(sampleRows));

		const entries = await loadData('test.tsv');

		expect(entries[0].sumDonated).toBe(0);
		expect(entries[0].sumNeeded).toBe(0);
		expect(entries[0].sumProjectedDonations).toBeUndefined();
	});

	it('sets hasDonation based on received or pledged', async () => {
		const rows = [
			{ month: '2025-01', needed: '1000', pledged: '0', received: '0' },
			{ month: '2025-02', needed: '1000', pledged: '0', received: '100' },
			{ month: '2025-03', needed: '1000', pledged: '50', received: '0' },
		];
		mockTsv.mockResolvedValue(mockTsvData(rows));

		const entries = await loadData('test.tsv');

		expect(entries[0].hasDonation).toBe(false);
		expect(entries[1].hasDonation).toBe(true);
		expect(entries[2].hasDonation).toBe(true);
	});

	it('returns empty array on fetch error', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => {});
		mockTsv.mockRejectedValue(new Error('network error'));

		const entries = await loadData('missing.tsv');

		expect(entries).toEqual([]);
	});
});

describe('processEntries', () => {
	it('computes cumulative sums', async () => {
		mockTsv.mockResolvedValue(mockTsvData(sampleRows));
		const raw = await loadData('test.tsv');

		const entries = processEntries(raw);

		expect(entries[0].sumDonated).toBe(800);
		expect(entries[1].sumDonated).toBe(800 + 800);
		expect(entries[2].sumDonated).toBe(800 + 800 + 1000);

		expect(entries[0].sumNeeded).toBe(1000);
		expect(entries[1].sumNeeded).toBe(2000);
		expect(entries[2].sumNeeded).toBe(3000);
	});

	it('computes projections starting from the first of the last 3 donation months', async () => {
		mockTsv.mockResolvedValue(mockTsvData(sampleRows));
		const raw = await loadData('test.tsv');

		const entries = processEntries(raw);

		entries.forEach((e) => {
			expect(e.sumProjectedDonations).toBeDefined();
		});
	});

	it('does not mutate the input entries', async () => {
		mockTsv.mockResolvedValue(mockTsvData(sampleRows));
		const raw = await loadData('test.tsv');

		processEntries(raw);

		expect(raw[0].sumDonated).toBe(0);
		expect(raw[0].sumNeeded).toBe(0);
	});

	it('handles entries with no donations gracefully', () => {
		const entries = processEntries([]);
		expect(entries).toEqual([]);
	});
});
