import Joi from "joi";

export const channelSchema = Joi.string().pattern(/^[a-z0-9_\-]$/i);