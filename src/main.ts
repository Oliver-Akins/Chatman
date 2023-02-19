// Filepath aliasing to avoid relative-imports whenever possible, this must stay
// at the top of this file as the first statement
import "module-alias/register";

import { JSONDatabase } from "./utils/database/json";
import { Server, Request } from "@hapi/hapi";
import { loadConfig } from "./utils/config";
import inert from "@hapi/inert";
import { Logger } from "tslog";
import path from "path";
import glob from "glob";


export const isDev = process.env.NODE_ENV?.startsWith(`dev`);
export const config = loadConfig();
export const database = new JSONDatabase(config.database);
export const log = new Logger({
	displayFilePath: `hidden`,
	displayFunctionName: false,
	minLevel: isDev ? `silly` : `info`
});

// Handle the system exiting so we can cleanup before shutting down
import { cleanExit } from "./utils/cleanExit";
process.on(`uncaughtException`, cleanExit);
process.on(`SIGTERM`, cleanExit);
process.on(`SIGINT`, cleanExit);


async function init() {

	const server = new Server({
		port: config.server.port,
		routes: {
			files: {
				relativeTo: path.join(__dirname, `../site`),
			},
			cors: true,
		},
	});

	await server.register(inert);

	// Register all the routes
	let files = glob.sync(
		`endpoints/**/!(*.map)`,
		{ cwd: __dirname, nodir: true}
	);
	for (var file of files) {
		let route = (await import(path.join(__dirname, file))).default;
		log.debug(`Registering route: ${route.method} ${route.path}`);
		server.route(route);
	};

	server.start().then(() => {
		log.info(`Server listening on ${server.info.uri}`);
	});
};

init();