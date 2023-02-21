import { anonymizePhrase, convertToKey, spacePhrase } from "$/utils/game";
import { channelSchema } from "$/schemas/general";
import { config, database } from "$/main";
import { ServerRoute } from "@hapi/hapi";
import { readFileSync } from "fs";
import boom from "@hapi/boom";
import Joi from "joi";

const route: ServerRoute = {
	method: `POST`, path: `/{channel}/game`,
	options: {
		validate: {
			params: Joi.object({
				channel: channelSchema,
			}),
			query: Joi.object({
				word_list: Joi.string(),
			}),
		},
	},
	async handler(request) {
		const { channel } = request.params;
		const { word_list } = request.query;

		let data = await database.getChannel(channel);


		if (config.game.files[word_list] == null) {
			throw boom.notAcceptable(`Invalid word list`);
		};
		let phrases = readFileSync(config.game.files[word_list] as string, `utf-8`).split(`\n`);
		let phrase = phrases[Math.floor(Math.random() * phrases.length)].trim();


		let spaced = spacePhrase(phrase.toUpperCase());
		let anonymized = anonymizePhrase(spaced);
		data.current = anonymized;
		data.solution = spaced;
		data.incorrect = 0;
		data.key = convertToKey(spaced);

		// Tell the overlay(s) to start a new game
		request.server.app.io.to(channel).emit(`state`, {
			active: true,
			current: data.current,
			incorrect: {
				current: data.incorrect,
				max: config.game.max_incorrect,
			},
		})

		return `${data.current} (incorrect: ${data.incorrect}/${config.game.max_incorrect})`;
	},
};
export default route;