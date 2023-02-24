import Joi from "joi";

const render = true;

export const penaltyOptionsSchema = Joi.object({
	guess: Joi
		.number()
		.integer()
		.min(0)
		.max(Joi.ref(`...max_incorrect`, { render }))
		.default(1),
	solve: Joi
		.number()
		.integer()
		.min(0)
		.max(Joi.ref(`...max_incorrect`, { render }))
		.default(1),
	duplicate: Joi
		.number()
		.integer()
		.min(0)
		.max(Joi.ref(`...max_incorrect`, { render }))
		.default(0),
})
.meta({ className: `penaltyOptions` })
.description(`The options for all of the penalties from actions`);

export const gameOptionsSchema = Joi.object({
	files: Joi.object().required().min(1).unknown(true),
	max_incorrect: Joi.number().min(1).default(6),
	penalties: penaltyOptionsSchema.required(),
})
.meta({ className: `gameOptions` })
.description(`The game-specific options`);

export const serverOptionsSchema = Joi.object({
	port: Joi
		.number()
		.port()
		.required()
		.description(`The port the server will run on`),
})
.meta({ className: `serverOptions` })
.description(`The web server options`);


export const databaseOptionsSchema = Joi.object({
	uri: Joi
		.string()
		.required()
		.description(`The location indicator where the database is. This can be a filepath or a socket URI, depending on what database is being used.`),
})
.meta({ className: `databaseOptions` })
.description(`The database specific options`);


export const configSchema = Joi.object({
	server: serverOptionsSchema.required(),
	database: databaseOptionsSchema.required(),
	game: gameOptionsSchema.required(),
})
.meta({ className: `config` })
.description(`The configuration format for the server`);