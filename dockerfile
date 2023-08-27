from node:19 as base

workdir /app

expose 6969

run npm install --global typescript@4

copy package*.json tsconfig.json /app/
run npm install

healthcheck CMD curl -f http://localhost:6969/health

copy ./src /app/src
run tsc


from base as dev
run npm install
cmd [ "/bin/bash" ]


from base as prod
copy ./docs /app/docs
run npm install --omit=dev
run rm -rf src tsconfig.json
cmd [ "NODE_ENV=production", "node", "dist/main.js" ]