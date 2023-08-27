import { ServerRoute } from "@hapi/hapi";

const route: ServerRoute = {
	method: `GET`, path: `/health`,
	async handler(_, h) {
		return h.response().code(204);
	},
};
export default route;