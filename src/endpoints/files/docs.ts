import { ServerRoute } from "@hapi/hapi";
import path from "path";

const route: ServerRoute = {
	method: `GET`, path: `/docs/{path*}`,
	options: {
		files: {
			relativeTo: path.join(process.cwd(), `docs`),
		},
	},
	handler: {
		directory: {
			path: `.`,
			index: true,
			redirectToSlash: true,
		},
	},
};
export default route;