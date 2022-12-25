import Joi from "joi";

export const nightbotCustomHeadersSchema = Joi.object({
	"nightbot-response-url": Joi
		.string()
		.uri({ scheme: `https` }),
	"nightbot-user": Joi
		.string(),
	"nightbot-channel": Joi
		.string(),
})
.meta({ className: `nightbotCustomHeaders` })
.description(`The custom headers Nightbot makes requests with`);