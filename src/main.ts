// Filepath aliasing to avoid relative-imports whenever possible, this must stay
// at the top of this file as the first statement
import "module-alias/register";

import { JSONDatabase } from "./utils/database/json";
import { Server as wsServer } from "socket.io";
import { loadConfig } from "./utils/config";
import { Server } from "@hapi/hapi";
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
			cors: true,
			files: {
				relativeTo: path.join(process.cwd(), `site`),
			},
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

	/*
	This is the Socket IO server instantiation, this is used by the overlays to
	get updates in real-time without needing to have a polling request unless
	it fails to upgrade to websockets.
	*/
	const io = new wsServer( server.listener );
	server.app.io = io;

	io.on(`connection`, (socket) => {
		log.debug(`New connection from: ${socket.id}`);

		/*
		The overlay is requesting state info for a specific channel, give it and
		add the socket to the channel's room.
		*/
		socket.on(`state`, async (channel: string) => {
			let data = await database.getChannel(channel);

			if (data == null) {
				return socket.emit(`state`, { active: false });
			};

			socket.join(channel);
			return socket.emit(`state`, {
				active: data.current != null,
				incorrect: {
					current: data.incorrect,
					max: config.game.max_incorrect,
				},
				current: data.current,
			});
		});
	});

	server.start().then(() => {
		log.info(`Server listening on ${server.info.uri}`);
	});
};

init();