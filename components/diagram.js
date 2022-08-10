
import { Chess } from 'https://deno.land/x/beta_chess@v1.0.1/chess.js';

import { Position, gif as encoder }
from 'https://deno.land/x/beta_chess_diagrams@v2.0.0/mod.ts';

export async function gif(game, perspective = 'w') {
	const p = new Position(game.board);
	const frames = [ await p.frame(perspective, true) ];
	for (let i = 1; game.takeback() != null; i++) {
		p.set(game.board).frame(perspective, true).then(
			f => frames[i] = f
		);
	}
	return encoder(frames.reverse());
}

export async function diagram(fen, perspective) {
	const game = new Chess(fen);
	perspective = perspective || game.turn;
	const p = new Position(game.board);
	return await p.picture(perspective);
}
