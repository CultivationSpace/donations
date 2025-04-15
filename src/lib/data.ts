
interface Entry {
	label: string;
	column: number;
	donors: number;
	donated: number;
	needed: number;
}


export function loadData(filename: string): Entry[] {
	const data = Deno.readTextFileSync(filename).split('\n').filter(line => line.trim() !== '').map(line => line.trim().split('\t'));
	const header = data.shift();

	if (header?.join(',') != 'month,donors,donated,needed') {
		throw new Error(`Invalid header, expected: "month,donors,donated,needed" but found "${header}"`);
	}

	const entries = data.map(fields => {
		const date = fields[0].split('-');
		const year = parseInt(date[0], 10);
		const month = parseInt(date[1], 10);

		let label = '';
		switch (month) {
			case 1: label = 'Jan'; break;
			case 2: label = 'Feb'; break;
			case 3: label = 'Mar'; break;
			case 4: label = 'Apr'; break;
			case 5: label = 'May'; break;
			case 6: label = 'Jun'; break;
			case 7: label = 'Jul'; break;
			case 8: label = 'Aug'; break;
			case 9: label = 'Sep'; break;
			case 10: label = 'Oct'; break;
			case 11: label = 'Nov'; break;
			case 12: label = 'Dec'; break;
		}


		return {
			label,
			column: (year - 2020) * 12 + month - 1,
			donors: parseInt(fields[1], 10),
			donated: parseFloat(fields[2]),
			needed: parseFloat(fields[3]),
		} as Entry;
	});

	entries.sort((a, b) => a.column - b.column);

	return entries;
}