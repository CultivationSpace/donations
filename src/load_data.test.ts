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

const { loadData } = await import('./load_data');

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

	it('sorts entries chronologically', async () => {
		const reversed = [...sampleRows].reverse();
		mockTsv.mockResolvedValue(mockTsvData(reversed));

		const entries = await loadData('test.tsv');

		expect(entries.map((e) => e.label)).toEqual(["Jan '25", 'Feb', 'Mar']);
	});

	it('shows year only for January labels', async () => {
		mockTsv.mockResolvedValue(mockTsvData(sampleRows));

		const entries = await loadData('test.tsv');

		expect(entries[0].label).toBe("Jan '25");
		expect(entries[1].label).toBe('Feb');
		expect(entries[2].label).toBe('Mar');
	});

	it('computes cumulative sums', async () => {
		mockTsv.mockResolvedValue(mockTsvData(sampleRows));

		const entries = await loadData('test.tsv');

		expect(entries[0].sumDonated).toBe(800);
		expect(entries[1].sumDonated).toBe(800 + 800);
		expect(entries[2].sumDonated).toBe(800 + 800 + 1000);

		expect(entries[0].sumNeeded).toBe(1000);
		expect(entries[1].sumNeeded).toBe(2000);
		expect(entries[2].sumNeeded).toBe(3000);
	});

	it('sets hasDonation based on received or pledged', async () => {
		const rows = [
			{ month: '2025-01', donors: '0', needed: '1000', pledged: '0', received: '0' },
			{ month: '2025-02', donors: '1', needed: '1000', pledged: '0', received: '100' },
			{ month: '2025-03', donors: '1', needed: '1000', pledged: '50', received: '0' },
		];
		mockTsv.mockResolvedValue(mockTsvData(rows));

		const entries = await loadData('test.tsv');

		expect(entries[0].hasDonation).toBe(false);
		expect(entries[1].hasDonation).toBe(true);
		expect(entries[2].hasDonation).toBe(true);
	});

	it('computes projections starting from the first of the last 3 donation months', async () => {
		mockTsv.mockResolvedValue(mockTsvData(sampleRows));

		const entries = await loadData('test.tsv');

		entries.forEach((e) => {
			expect(e.sumProjectedDonations).toBeDefined();
		});
	});

	it('returns empty array on fetch error', async () => {
		vi.spyOn(console, 'error').mockImplementation(() => {});
		mockTsv.mockRejectedValue(new Error('network error'));

		const entries = await loadData('missing.tsv');

		expect(entries).toEqual([]);
	});
});
