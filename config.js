
Array.prototype.random = function() {
	return this[Math.floor((Math.random() * this.length))];
};

export const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
export const ordinal = n => {
	const s = [ "th", "st", "nd", "rd" ];
	const v = `${n}`, l = parseInt(v[v.length - 1]);
	if (n == 11 || n == 12 || n == 13) return `${n}th`;
	return n + (l < 4 ? s[l] : s[0]);
};

export const Name = "en passant";
export const Prefix = '!';

export const Streamer = "thechessnerdlive";
export const StreamerID = "428214501";
export const ZACH_FIDE_ID = "2624346";
export const DISCORD = "discord.gg/DKHBFF22TJ";

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
		const cd = 24 * 60 * 60 * 1000, ch = 60 * 60 * 1000;
		let d = Math.floor(t / cd),
		h = Math.floor((t - d * cd) / ch),
		m = Math.round((t - d * cd - h * ch) / 60000);
		if (m === 60) { h++; m = 0; }
		if (h === 24) { d++; h = 0; }
		let v = '';
		if (d > 0) v += d + 'd ';
		if (h > 0) v += h + 'h ';
		if (m > 0) v += m + 'm ';
		return v.trim();
	},
	difference: (major, minor) => {
		if (major < minor) [ major, minor ] = [ minor, major ];
		const monthsDays = [ 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31 ];
		const majorDays = Math.floor(major.valueOf() / 86400000);
		const minorDays = Math.floor(minor.valueOf() / 86400000);
		let delta = majorDays - minorDays, years = 0, months = 0;
		let i = minor.getFullYear(), l = leap(i) ? 366 : 365;
		while (delta >= l) delta -= l = (leap(i++) ? 366 : 365);
		years = i - minor.getFullYear();
		while (delta >= monthsDays[months]) delta -= monthsDays[months++];
		return { years, months, weeks: Math.floor(delta / 7), days: delta % 7 };
	}
};

const leap = y => ((y % 4 === 0) && (y % 100 !== 0)) || (y % 400 === 0);
