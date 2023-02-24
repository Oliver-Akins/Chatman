export type key = {[index: string]: number[]}

/**
 * Takes a guess and adds it into the game board, this is equivalent to writing
 * the letter above the underscore, without keeping the underscore.
 *
 * @param key An object with keys of single letters, and their indexes in the
 * solution that they were removed from
 * @param current The player's current game board
 * @param letter The letter that is being added
 * @returns The updated game board
 */
export function addLetter(key: any, current: string, letter: string) {
	let indexes = key[letter];
	for (const i of indexes) {
		current = current.slice(0, i) + letter.toUpperCase() + current.slice(i+1);
	};
	return current;
};

/**
 * Creates the key object so we can update the game board easier
 *
 * @param phrase The already-spaced phrase
 * @returns An object with the keys as a single letter, and the value as an array
 * of integers that the letter appears at
 */
export function convertToKey(phrase: string): key {
	let key: key = {};
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

/**
 * Creates a copy of the phrase string that has all English alphabet characters
 * replaced with underscores
 *
 * @param phrase The phrase to make anonymous
 * @returns The anonymized phrase
 */
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

/**
 * Creates a copy of the phrase and puts spaces between each character and replaces
 * spaces from the original phrase with a special character
 *
 * @param phrase The phrase to space apart
 * @returns A copy of the phrase with extra spaces
 */
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