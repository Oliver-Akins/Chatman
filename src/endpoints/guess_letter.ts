import { database } from "$/main";
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
		console.log(data)
		if (data.solution.includes(guess)) {
			data.current = addLetter(data.key, data.current, guess);
		} else {
			data.incorrect++;
		};
		return `${data.current} (incorrect: ${data.incorrect}/6)`;
	},
};
export default route;