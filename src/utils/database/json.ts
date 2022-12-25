import { databaseOptions } from "$/types/config";
import fs from "fs";

export class JSONDatabase {
	private data: any = {};
	private conf: databaseOptions;

	constructor(conf: databaseOptions) {
		this.conf = conf;

		if (!fs.existsSync(conf.uri)) {
			console.error(`Can't find database file, creating default`);
			try {
				fs.writeFileSync(conf.uri, `{}`);
			} catch (_) {
				console.log(`Couldn't create database file, ensure the uri is a valid filepath`);
			};
		};
		this.data = JSON.parse(fs.readFileSync(conf.uri, `utf-8`));
	};

	public shutdown() {
		fs.writeFileSync(this.conf.uri, JSON.stringify(this.data));
	};

	public async createChannel(name: string) {
		this.data[name] = {
			current: null,
			solution: null,
			key: null,
			incorrect: 0,
		};
	};

	public async getChannel(name: string) {
		return this.data[name];
	};
};