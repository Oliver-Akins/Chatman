import { nightbotCustomHeadersSchema } from "$/schemas/nightbot";
import { escapeDiscordMarkdown } from "$/utils/markdown";
import { Request, ServerRoute } from "@hapi/hapi";
import { config } from "$/main";
import boom from "@hapi/boom";
import Joi from "joi";

const MOD_LEVELS = [
	`moderator`,
	`owner`,
];

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

			let r = await req.server.inject({
				method: `POST`,
				url: `/${meta.channel}/guess`,
				payload: {
					type: `letter`,
					guess: meta.args[1]
				}
			});

			if (r.statusCode != 200) {
				return `Something went wrong : ` + r.statusMessage;
			};
			let d = JSON.parse(r.payload);
			let m: string;
			switch (d.status) {
				case 1:
					m = `"${meta.args[1].toUpperCase()}" has been guessed already. \n(incorrect: ${d.incorrect}/${config.game.max_incorrect})`;
					break;
				case 2:
					m = `Merry chatmanmas! You won! Answer: ${d.current}`;
					break;
				case 3:
					m = `Booooo, you lost! Answer: ${d.current}`;
					break;
				case 4:
					m = `${d.current} \n(incorrect:${d.incorrect}/${config.game.max_incorrect})`;
					break;
				default: m = `Unknown guess status: ${d.status}`;
			};
			return m;
		},
	},
	"solve": {
		modOnly: false,
		async handler(meta, req) {

			if (meta.args.length < 2) {
				return `You need to provide a solution if you want to solve!`;
			};

			let r = await req.server.inject({
				method: `POST`,
				url: `/${meta.channel}/guess`,
				payload: {
					type: `solve`,
					guess: meta.args[1]
				}
			});

			if (r.statusCode != 200) {
				return `Something went wrong : ` + r.statusMessage;
			};
			let d = JSON.parse(r.payload);
			let m: string;
			switch (d.status) {
				case 1:
					m = `"${meta.args[1].toUpperCase()}" has been guessed already. \n(incorrect: ${d.incorrect}/${config.game.max_incorrect})`;
					break;
				case 2:
					m = `Merry chatmanmas! You won! Answer: ${d.current}`;
					break;
				case 3:
					m = `Booooo, you lost! Answer: ${d.current}`;
					break;
				case 4:
					m = `${d.current} \n(incorrect:${d.incorrect}/${config.game.max_incorrect})`;
					break;
				default: m = `Unknown guess status: ${d.status}`;
			};
			return m;
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
			args = [`guess`, args[0]];
		};

		let sc = args[0];
		if (subcommands[sc] == null) {
			return `Invalid subcommand. Valid options: ${Object.keys(subcommands).join(`, `)}`;
		};

		if (subcommands[sc].modOnly && !MOD_LEVELS.includes(userData.get(`userLevel`) ?? ``)) {
			return `That command is mod-only! :P`;
		};

		let m = await subcommands[sc].handler(
			{ channel, user, args },
			request
		);

		if (channelData.get(`provider`) == `discord`) {
			m = escapeDiscordMarkdown(m);
		};
		return m;
	},
};
export default route;