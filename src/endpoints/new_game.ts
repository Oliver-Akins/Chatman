import { anonymizePhrase, convertToKey, spacePhrase } from "$/utils/game";
import { channelSchema } from "$/schemas/general";
import { config, database, log } from "$/main";
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
		if (data == null) {
			throw boom.badRequest(`Couldn't find the requested channel's information, make sure to register it`);
		};


		if (config.game.files[word_list] == null) {
			throw boom.notAcceptable(`Invalid word list`);
		};
		let phrases: string[];
		try {
			phrases = readFileSync(config.game.files[word_list] as string, `utf-8`).split(`\n`);
		} catch {
			return `Couldn't load word list "${word_list}", please try a different one`;
		};
		let phrase = phrases[Math.floor(Math.random() * phrases.length)].trim();

		log.info(`New game in ${channel} with answer: ${phrase}`);

		let spaced = spacePhrase(phrase.toUpperCase());
		let anonymized = anonymizePhrase(spaced);
		data.current = anonymized;
		data.solution = spaced;
		data.incorrect = 0;
		data.key = convertToKey(spaced);
		data.guesses = [];

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
