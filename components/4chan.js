
export async function boards() {
	const endpoint = 'https://a.4cdn.org/boards.json';
	const data = await fetch(endpoint);
	if (data.ok) {
		const json = await data.json();
		return json.boards;
	}
	return null;
}

export async function randomBoard() {
	const b = await boards();
	if (b === null) return null;
	return b[Math.floor(Math.random() * b.length)];
}

export async function randomThread(board) {
	if (board === null) return null;
	const endpoint = `https://a.4cdn.org/${board.board}/threads.json`;
	const data = await fetch(endpoint);
	if (!data.ok) return null;
	const json = await data.json();
	const threads = json[0].threads;
	return threads[Math.floor(Math.random() * threads.length)];
}

export async function posts(board, thread) {
	const endpoint = `https://a.4cdn.org/${board.board}/thread/${thread.no}.json`;
	const data = await fetch(endpoint);
	if (!data.ok) return null;
	const json = await data.json();
	return json.posts.filter(p => p.com !== undefined).map(post => ({
		message: post.com.replace(/^<a.*?<br>/g, '')
			.replace(/(<br>)+/g, '\n')
			.replace(/<a.*?class="quotelink">.*?<\/a>/g, '')
			.replace(/<span class="deadlink">.*?<\/span>/g, '')
			.replace(/<span class="quote">&gt;/g, '<span class="quote">'),
		date: post.time,
	}));
}
