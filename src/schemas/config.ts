import Joi from "joi";


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
})
.meta({ className: `config` })
.description(`The configuration format for the server`);