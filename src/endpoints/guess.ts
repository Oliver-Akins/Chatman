import { config, database } from "$/main";
import { addLetter } from "$/utils/game";
import { ServerRoute } from "@hapi/hapi";
import Joi from "joi";

const route: ServerRoute = {
	method: `POST`, path: `/{channel}/guess`,
	options: {
		validate: {
			params: Joi.object({
				channel: Joi.string().alphanum(),
			}),
			payload: Joi.object({
				guess: Joi.string().length(1),
			}),
		},
	},
	async handler(request) {
		// @ts-ignore
		const guess = request.payload.guess.toUpperCase();
		const { channel } = request.params;

		let data = await database.getChannel(channel);

		if (data.key[guess] != null) {
			data.current = addLetter(data.key, data.current, guess);

			/*
			The player(s) won the game, so we want to tell the overlay(s) and
			then respond to the request.
			*/
			if (data.current == data.solution) {
				request.server.app.io.to(channel).emit(`finish`, {
					win: true,
					solution: data.solution,
				});
				return `Congrats! You won. Merry Chatmanmas! Answer: ${data.current}`;
			};
		} else {
			data.incorrect++;
		};


		/*
		The guess caused the player(s) to lose, so we want to tell all of the
		overlays and then the user.
		*/
		if (data.incorrect >= config.game.max_incorrect) {
			request.server.app.io.to(channel).emit(`finish`, {
				win: false,
				solution: data.solution,
			});
			return `Oop, you ded. Answer: ${data.solution}`;
		};

		// Update all the overlays for the channel
		request.server.app.io.to(channel).emit(`update`, {
			current: data.current,
			incorrect: {
				current: data.incorrect,
				max: config.game.max_incorrect,
			},
		});
		return `${data.current} (incorrect: ${data.incorrect}/${config.game.max_incorrect})`;
	},
};
export default route;