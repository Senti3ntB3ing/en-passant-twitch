
export async function getChess_comUser(user) {
	user = encodeURIComponent(user);
	const url = 'https://api.chess.com/pub/player/';
	try {
		const response = await fetch(url + user);
		if (response.status != 200) return null;
		return await response.json();
	} catch { return null; }
}

export async function getChess_comUserStats(user) {
	user = encodeURIComponent(user);
	const url = `https://api.chess.com/pub/player/${user}/stats`;
	try {
		const response = await fetch(url);
		if (response.status != 200) return null;
		return await response.json();
	} catch { return null; }
}

export async function existsChess_com(user) {
	user = encodeURIComponent(user);
	const url = `https://api.chess.com/pub/player/${user}/stats`;
	try {
		const response = await fetch(url);
		return (response.status == 200);
	} catch { return false; }
}

export async function getChess_comRatings(user) {
	const categories = [ 'rapid', 'blitz', 'bullet' ];
	const ratings = [];
	const chess_com = await getChess_comUserStats(user);
	if (chess_com == null) return undefined;
	for (const category of categories) {
		const key = 'chess_' + category;
		if (chess_com[key] == undefined ||
			chess_com[key].last == undefined ||
			chess_com[key].last.rating == undefined) continue;
		const rating = { category, rating: 'unrated' };
		if (!isNaN(parseInt(chess_com[key].last.rating)))
			rating.rating = chess_com[key].last.rating;
		ratings.push(rating);
	}
	return ratings;
}

export async function getChess_comPB(user) {
	const categories = [ 'rapid', 'blitz', 'bullet' ];
	const ratings = [];
	const chess_com = await getChess_comUserStats(user);
	if (chess_com == null) return undefined;
	for (const category of categories) {
		const key = 'chess_' + category;
		if (chess_com[key] == undefined ||
			chess_com[key].best == undefined ||
			chess_com[key].best.rating == undefined) continue;
		const rating = { category, rating: 'unrated' };
		if (!isNaN(parseInt(chess_com[key].best.rating)))
			rating.rating = chess_com[key].best.rating;
		ratings.push(rating);
	}
	return ratings;
}

export async function getChess_comPuzzles(user) {
	const ratings = [];
	const chess_com = await getChess_comUserStats(user);
	if (chess_com == null) return undefined;
	if (chess_com['tactics'] != undefined &&
		chess_com['tactics'].highest != undefined &&
		chess_com['tactics'].highest.rating != undefined &&
		!isNaN(parseInt(chess_com['tactics'].highest.rating))) ratings.push({
			category: 'tactics', rating: chess_com['tactics'].highest.rating
	});
	if (chess_com['puzzle_rush'] != undefined &&
		chess_com['puzzle_rush'].best != undefined &&
		chess_com['puzzle_rush'].best.score != undefined &&
		!isNaN(parseInt(chess_com['puzzle_rush'].best.score))) ratings.push({
			category: 'puzzle rush', rating: chess_com['puzzle_rush'].best.score
	});
	return ratings;
}

