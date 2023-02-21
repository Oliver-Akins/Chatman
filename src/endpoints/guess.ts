import { addLetter, spacePhrase } from "$/utils/game";
import { channelSchema } from "$/schemas/general";
import { config, database } from "$/main";
import { ServerRoute } from "@hapi/hapi";
import Joi from "joi";

const route: ServerRoute = {
	method: `POST`, path: `/{channel}/guess`,
	options: {
		validate: {
			params: Joi.object({
				channel: channelSchema,
			}),
			payload: Joi.object({
				type: Joi.string().valid(`letter`, `solve`),
				guess: Joi.when(`type`, {
						is: `letter`,
						then: Joi.string().length(1),
						otherwise: Joi.string(),
					}),
			}),
		},
	},
	async handler(request) {
		// @ts-ignore
		let { guess, type } = request.payload;
		guess = guess.toUpperCase();
		const { channel } = request.params;

		let data = await database.getChannel(channel);

		let won = false;

		// The user is guessing a single letter
		if (type === `letter`) {
			if (data.key[guess] != null) {
				data.current = addLetter(data.key, data.current, guess);
				won = data.current == data.solution;
			};
		}

		// The user is guessing the entire solution
		else if (type === `solve`) {
			guess = spacePhrase(guess).replace(/[^a-z█] /gi, ``);
			let solved = data.solution.replace(/[^a-z█] /gi, ``);

			if (guess === solved) {
				won = true;
			} else {
				data.incorrect += config.game.incorrect_solve_penalty;
			};
		};


		/*
		The player(s) won the game, so we want to tell the overlay(s) and
		then respond to the request.
		*/
		if (won) {
			request.server.app.io.to(channel).emit(`finish`, {
				win: true,
				solution: data.solution,
			});

			// NOTE: This might cause reference issues with the return
			await database.resetChannel(channel);
			return `Congrats! You won. Merry Chatmanmas! Answer: ${data.solution}`;
		};


		/*
		The guess caused the player(s) to lose, so we want to tell all of the
		overlays and then the user.
		*/
		if (data.incorrect >= config.game.max_incorrect) {
			request.server.app.io.to(channel).emit(`finish`, {
				win: false,
				solution: data.solution,
			});

			// NOTE: This might cause reference issues with the return
			await database.resetChannel(channel);
			return `Oop, you ded. Answer: ${data.solution}`;
		};


		// clamp the incorrect value to prevent weird behaviours in overlays
		data.incorrect = Math.min(data.incorrect, config.game.max_incorrect);

		/*
		Update all the overlays for the channel and tell the user the new game
		state.
		*/
		request.server.app.io.to(channel).emit(`update`, {
			current: data.current,
			incorrect: {
				current: data.incorrect,
				max: config.game.max_incorrect,
			},
		});
		return `${data.current} (incorrect: ${data.incorrect}/${config.game.max_incorrect})`;
	},
};
export default route;