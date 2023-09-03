import { channelSchema } from "$/schemas/general";
import { ServerRoute } from "@hapi/hapi";
import { database, log } from "$/main";
import Joi from "joi";

const route: ServerRoute = {
	method: `DELETE`, path: `/{channel}/game`,
	options: {
		validate: {
			params: Joi.object({
				channel: channelSchema,
			}),
		},
	},
	async handler(request) {
		const { channel } = request.params;
		log.info(`Ending game for channel: ${channel}`);

		await database.resetChannel(channel);

		// Tell the overlay(s) to end the game
		request.server.app.io.to(channel).emit(`finish`, {
			active: false,
			win: null,
			solution: null,
		});

		return `Reset the game, start a new game to keep playing`;
	},
};
export default route;
