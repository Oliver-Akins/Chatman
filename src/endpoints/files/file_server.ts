import { ServerRoute } from "@hapi/hapi";
import { log } from "$/main";
import path from "path";
import Joi from "joi";
import { channelSchema } from "$/schemas/general";

const route: ServerRoute = {
	method: `GET`, path: `/{channel}/overlay/{theme}/{path*}`,
	options: {
		validate: {
			params: Joi.object({
				channel: channelSchema,
				theme: Joi.string().pattern(/^[a-z0-9\-]+$/),
				path: Joi.string().optional(),
			}),
		},
		files: {
			relativeTo: path.join(process.cwd(), `site`),
		},
	},
	handler(request, h) {
		const path = request.params.path;
		const theme = request.params.theme.replace(/\-/g, `/`);

		let file: string;
		if (path == null || path === `/`) {
			file = `index.html`
		} else {
			file = path;
		};

		log.silly(`Attempting to load file ${file} from theme ${theme}`);
		return h.file(`${theme}/${file}`);
	},
};
export default route;