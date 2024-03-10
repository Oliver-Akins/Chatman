const app = new Vue({
	el: `#app`,
	data: {
		io: null,
		gameActive: false,
		current: null,
		incorrect: 0,
		max_incorrect: 0,
		channel: null,
		close_timeout_id: null,
	},
	computed: {
		showOverlay() {
			return this.channel
				&& this.gameActive
				&& this.current
				&& this.max_incorrect > 0;
		},
		totalHealth() {
			return this.max_incorrect;
		},
		lostHealth() {
			return this.incorrect;
		},
		currentHealth() {
			return this.totalHealth - this.lostHealth;
		},
		parsedText() {
			return this.current.split(` █ `).join(`<br>`);
		},
	},
	methods: {
		connected() {
			this.io.on(`finish`, this.finishGame);
			this.io.on(`update`, this.newState);
			this.io.on(`state`, this.activity);

			this.io.emit(`state`, this.channel);
		},
		/*
		{
			active: boolean,
			current: string,
			incorrect: {
				current: number,
				max: number,
			},
		}
		*/
		activity(d) {
			if (d.active) {
				this.newState(d);
				this.gameActive = true;
			};
		},
		newState(d) {
			clearTimeout(this.close_timeout_id);
			this.close_timeout_id = null;
			this.current = d.current;
			this.incorrect = d.incorrect.current;
			this.max_incorrect = d.incorrect.max;
		},
		finishGame(d) {
			if (d.win == null) {
				this.close_timeout_id = setTimeout(() => {
					this.current = null;
					this.incorrect = 0;
					this.max_incorrect = 0;
					this.gameActive = false;
				}, 5_000);
			}

			if (d.win) {
				this.incorrect = -2;
			};

			this.incorrect = this.max_incorrect;
			this.current = d.solution;
			this.close_timeout_id = setTimeout(() => {
				this.current = null;
				this.incorrect = 0;
				this.max_incorrect = 0;
				this.gameActive = false;
			}, 5_000);
		},
	},
	mounted() {
		const url = new URL(window.location.href);
		let path = url.pathname.split(`/`);
		this.channel = path[1];

		this.io = io(window.location.host, { path: path[0] });
		this.io.on(`connect`, this.connected);
	},
});
