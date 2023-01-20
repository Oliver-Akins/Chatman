# Chatman
A REST API that can be used to play Hangman with predefined words.

Originally developed to play Hangman in [CzechGamesEdition's Twitch Channel](https://twitch.tv/CzechGamesEdition)
using the custom Codenames deck created by chat submissions.

# Setup

## Development
1. `pnpm install` (install pnpm if it isn't installed already)
2. `cp config.template.toml config.toml`
3. `make interfaces` (re-run whenever you change a schema in `src/schemas/*`)
4. `make dev` (compiles and runs the code in dev mode) or `make rund` (skips the compile step, runs it in dev mode)

## Production
1. Same steps as Development, but use `make run` to run the API in production mode. You may need to change the `NODE` argument in the makefile to make it run correctly.