import { database } from "$/main";

export function cleanExit() {
	database.shutdown();
	process.exit(0);
};