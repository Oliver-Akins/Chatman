import { database } from "$/main";
import { anonymizePhrase, convertToKey, spacePhrase } from "$/utils/game";
import { ServerRoute } from "@hapi/hapi";
import Joi from "joi";

const route: ServerRoute = {
	method: `POST`, path: `/{channel}/game`,
	options: {
		validate: {
			params: Joi.object({
				channel: Joi.string().alphanum(),
			}),
		},
	},
	async handler(request) {
		const { channel } = request.params;

		let data = await database.getChannel(channel);

		// TODO: Get the proper phrase
		let phrase = "Hello world";

		let spaced = spacePhrase(phrase.toUpperCase());
		let anonymized = anonymizePhrase(spaced);
		data.current = anonymized;
		data.solution = spaced;
		data.incorrect = 0;
		data.key = convertToKey(spaced);

		return `${data.current} (incorrect: ${data.incorrect}/6)`;
	},
};
export default route;