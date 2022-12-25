import { nightbotCustomHeadersSchema } from "$/schemas/nightbot";
import { ServerRoute } from "@hapi/hapi";
import boom from "@hapi/boom";
import Joi from "joi";

const subcommands = {
	"start": {
		method: `POST`,
		modOnly: true,
	},
	"show": {
		method: `GET`,
		modOnly: false,
	},
};

const route: ServerRoute = {
	method: `GET`, path: `/nightbot`,
	options: {
		validate: {
			query: Joi.object({
				args: Joi.string().allow("").required(),
				msg: Joi.string(),
			}),
			headers: nightbotCustomHeadersSchema.unknown(),
		},
	},
	async handler(request) {
		let args = (<string>request.query.args)
			.split(` `)
			.filter(x => x.length > 0);

		if (args.length < 1) {
			return `Not enough arguments`;
		};

		let channelData = new URLSearchParams(request.headers["nightbot-channel"]);
		let channel = channelData.get(`name`);
		let userData = new URLSearchParams(request.headers["nightbot-user"]);
		let user = userData.get(`name`);

		if (!channel) { throw boom.badData(`Missing channel name`) };
		if (!user) { throw boom.badData(`Missing user name`) };

		// User is guessing a letter
		if (args[0].length == 1) {
			return (await request.server.inject({
				method: `POST`, url: `/${channel}/guess`,
				payload: { guess: args[0] }
			})).payload;
		};
	},
};
export default route;