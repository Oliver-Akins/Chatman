import { ServerRoute } from "@hapi/hapi";

const route: ServerRoute = {
	method: `*`, path: `/ping`,
	options: {},
	async handler() {
		return `pong!`;
	},
};
export default route;