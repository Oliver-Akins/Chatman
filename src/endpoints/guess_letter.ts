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

			if (data.current == data.solution) {
				return `Congrats! You won. Merry Chatmanmas!`;
			};
		} else {
			data.incorrect++;
		};
		if (data.incorrect >= config.game.max_incorrect) {
			return `Oop, you ded. Answer: ${data.solution}`;
		};
		return `${data.current} (incorrect: ${data.incorrect}/${config.game.max_incorrect})`;
	},
};
export default route;