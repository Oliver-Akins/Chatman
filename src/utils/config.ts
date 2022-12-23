import { configSchema } from "$/schemas/config";
import type { config } from "$/types/config";
import { isDev } from "$/main";
import toml from "@iarna/toml";
import fs from "fs";


/**
 * Attempts to load the config from disk and validate it's structure.
 */
export function loadConfig() {
	let file = null;

	if (isDev) {
		try {
			file = fs.readFileSync(`./config.dev.toml`, `utf-8`);
		} catch (_) {
			console.error(`Couldn't find development config, checking production`);
		};
	};

	if (!file) {
		try {
			file = fs.readFileSync(`./config.toml`, `utf-8`);
		} catch (_) {
			console.error(`Couldn't find production config. Fill out the config and run the server again`);
			process.exit(1);
		};
	};

	try {
		var data = toml.parse(file);
	} catch (_) {
		console.error(`Invalid TOML file, stopping server`);
		process.exit(1);
	};

	let { error, value } = configSchema.validate(data, { abortEarly: false });
	if (error) {
		console.error(`Config failed to validate, see below for details:`)
		for (const err of error.details) {
			console.error(` - ${err.message}`);
		};
		process.exit(1);
	};

	return value as config;
};