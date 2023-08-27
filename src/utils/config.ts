import { configSchema } from "$/schemas/config";
import type { config } from "$/types/config";


/**
 * Attempts to load the config from disk and validate it's structure.
 */
export function loadConfig(): config {
	const data: config = {
		database: {
			uri: `./data.json`,
		},
		game: {
			files: {},
			penalties: {
				guess: 1,
				solve: 2,
				duplicate: 0,
			},
			max_incorrect: 6,
		},
		server: {
			port: 6969,
		},
	};

	for (var envvar in process.env) {
		let value = process.env[envvar];
		if (envvar.startsWith(`FILE_`)) {
			data.game.files[envvar.slice(5).toLowerCase()] = value;
		};
	};
	console.log(data.game.files)

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