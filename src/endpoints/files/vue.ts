import { ServerRoute } from "@hapi/hapi";
import { isDev } from "$/main";

const route: ServerRoute = {
	method: `GET`, path: `/vue.js`,
	options: {},
	handler(_, h) {
		if (isDev) {
			return h.redirect(`https://cdn.jsdelivr.net/npm/vue@2/dist/vue.js`);
		}
		return h.redirect(`https://cdn.jsdelivr.net/npm/vue@2`);
	},
};
export default route;