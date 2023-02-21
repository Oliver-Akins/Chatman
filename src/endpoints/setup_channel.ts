import { channelSchema } from "$/schemas/general";
import { ServerRoute } from "@hapi/hapi";
import { database } from "$/main";
import Joi from "joi";

const route: ServerRoute = {
	method: `POST`, path: `/channels`,
	options: {
		validate: {
			payload: Joi.object({
				channel: channelSchema,
			}),
		},
	},
	async handler(request, h) {
		// @ts-ignore
		await database.createChannel(request.payload.channel);
		return h.close;
	},
};
export default route;