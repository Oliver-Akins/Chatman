export function addLetter(key: any, current: string, letter: string) {
	let indexes = key[letter];
	for (const i of indexes) {
		current = current.slice(0, i) + letter.toUpperCase() + current.slice(i+1);
	};
	return current;
};

export function convertToKey(phrase: string) {
	let key: {[index: string]: number[]} = {};
	for (var i = 0; i < phrase.length; i++) {
		let letter = phrase[i].toUpperCase();
		if (!letter.match(/[a-zA-Z]/)) { continue };
		if (key[letter] == null) {
			key[letter] = [];
		};
		key[letter].push(i);
	};
	return key;
};

export function anonymizePhrase(phrase: string) {
	let anon = ``;
	for (const letter of phrase) {
		if (letter.match(/[A-Za-z]/)) {
			anon += `_`;
		} else {
			anon += letter;
		};
	};
	return anon;
};

export function spacePhrase(phrase: string) {
	let spaced = ``;
	for (const letter of phrase) {
		if (letter == ` `) {
			spaced += `█ `;
		} else {
			spaced += `${letter} `;
		};
	};
	return spaced;
};