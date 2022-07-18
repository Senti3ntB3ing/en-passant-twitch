
export async function getLichessUser(user) {
	user = encodeURIComponent(user);
	const url = 'https://lichess.org/api/user/';
	try {
		const response = await fetch(url + user);
		if (response.status != 200) return null;
		return await response.json();
	} catch { return null; }
}

export async function getLichessRatings(user) {
	const categories = [ 'classical', 'rapid', 'blitz', 'bullet' ];
	let ratings = [];
	const lichess = await getLichessUser(user);
	if (lichess == null || lichess.perfs == undefined) return undefined;
	for (const category of categories) {
		if (lichess.perfs[category] == undefined ||
			lichess.perfs[category].rating == undefined) continue;
		let rating = { category, rating: 'unrated' };
		if (!isNaN(parseInt(lichess.perfs[category].rating)))
			rating.rating = lichess.perfs[category].rating;
		ratings.push(rating);
	}
	return ratings;
}
