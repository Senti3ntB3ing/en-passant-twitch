
export const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
export const ordinal = n => {
	const s = [ 'th', 'st', 'nd', 'rd' ];
	const v = `${n}`, l = parseInt(v[v.length - 1]);
	if (n == 11 || n == 12 || n == 13) return `${n}th`;
	return n + (l < 4 ? s[l] : s[0]);
};

export const Name = 'en passant';
export const Prefix = '!';

export const Streamer = 'thechessnerdlive';
export const StreamerID = '428214501';
export const ZACH_FIDE_ID = '2624346';

export const saxon_genitive = s => s + (s[s.length - 1] == 's' ? "'" : "'s");

export const Time = {
	second: 1000,
	minute: 60 * 1000,
	quarter: 15 * 60 * 1000,
	hour: 60 * 60 * 1000,
	day: 24 * 60 * 60 * 1000,
	week: 7 * 24 * 60 * 60 * 1000,
	month: 30 * 24 * 60 * 60 * 1000,
	year: 365 * 24 * 60 * 60 * 1000,
	seconds: t => t * 1000,
	minutes: t => t * 60 * 1000,
	quarters: t => t * 15 * 60 * 1000,
	hours: t => t * 60 * 60 * 1000,
	days: t => t * 24 * 60 * 60 * 1000,
	weeks: t => t * 7 * 24 * 60 * 60 * 1000,
	months: t => t * 30 * 24 * 60 * 60 * 1000,
	years: t => t * 365 * 24 * 60 * 60 * 1000,
	value: t => {
		let cd = 24 * 60 * 60 * 1000,
		ch = 60 * 60 * 1000,
		d = Math.floor(t / cd),
		h = Math.floor((t - d * cd) / ch),
		m = Math.round((t - d * cd - h * ch) / 60000),
		pad = n => n < 10 ? '0' + n : n;
		if (m === 60) { h++; m = 0; }
		if (h === 24) { d++; h = 0; }
		let v = '';
		if (d > 0) v += d + 'd ';
		if (h > 0) v += h + 'h ';
		if (m > 0) v += m + 'm ';
		return v.trim();
	}
};

export const Size = {
	byte: 1,
	kilobyte: 1024,
	megabyte: 1024 ** 2,
	gigabyte: 1024 ** 3,
	terabyte: 1024 ** 4,
	bytes: t => t,
	kilobytes: t => t * 1024,
	megabytes: t => t * 1024 ** 2,
	gigabytes: t => t * 1024 ** 3,
	terabytes: t => t * 1024 ** 4,
};
