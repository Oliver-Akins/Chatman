import { nightbotCustomHeadersSchema } from "$/schemas/nightbot";
import { Request, ServerRoute } from "@hapi/hapi";
import boom from "@hapi/boom";
import Joi from "joi";

interface meta {
	args: string[];
	channel: string;
	user: string;
}

interface subcommand {
	modOnly: boolean;
	handler: (meta: meta, req: Request) => Promise<any>;
}

const subcommands: {[index: string]: subcommand} = {
	"start": {
		modOnly: true,
		async handler(meta, req) {
			let wl = req.query.words;

			return (await req.server.inject({
				method: `POST`,
				url: `/${meta.channel}/game?word_list=${wl}`
			})).payload;
		},
	},
	"show": {
		modOnly: false,
		async handler(meta, req) {
			return (await req.server.inject({
				method: `GET`,
				url: `/${meta.channel}/game`
			})).payload;
		},
	},
	"guess": {
		modOnly: false,
		async handler(meta, req) {

			if (meta.args.length < 2) {
				return `You need to provide a guess if you want to guess!`
			};

			if (meta.args[1].length > 1) {
				return `You can only guess one letter at a time!`
			};

			return (await req.server.inject({
				method: `POST`,
				url: `/${meta.channel}/guess`,
				payload: {
					guess: meta.args[1]
				}
			})).payload;
		},
	},
};

const route: ServerRoute = {
	method: `GET`, path: `/nightbot`,
	options: {
		validate: {
			query: Joi.object({
				args: Joi.string().allow("").required(),
				words: Joi.string(),
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

		let sc = args[0];
		if (subcommands[sc] == null) {
			return `Invalid subcommand. Valid options: ${Object.keys(subcommands).join(`, `)}`;
		};

		if (subcommands[sc].modOnly && userData.get(`userLevel`) != `moderator`) {
			return `That command is mod-only! :P`;
		};

		return subcommands[sc].handler(
			{ channel, user, args },
			request
		);
	},
};
export default route;