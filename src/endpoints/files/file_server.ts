import { ServerRoute } from "@hapi/hapi";
import { log } from "$/main";
import path from "path";

const route: ServerRoute = {
	method: `GET`, path: `/{channel}/overlay/{theme}/{path*}`,
	options: {
		files: {
			relativeTo: path.join(process.cwd(), `site`),
		},
	},
	handler(request, h) {
		// const theme = request.query.theme;
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