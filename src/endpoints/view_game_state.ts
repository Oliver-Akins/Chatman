import { ServerRoute } from "@hapi/hapi";
import { database } from "$/main";
import Joi from "joi";

const route: ServerRoute = {
	method: `GET`, path: `/{channel}/game`,
	options: {
		validate: {
			params: Joi.object({
				channel: Joi.string().alphanum(),
			}),
		},
	},
	async handler(request) {
		const { channel } = request.params;

		let { current, incorrect } = await database.getChannel(channel);
		return { current, incorrect };
	},
};
export default route;