export function escapeDiscordMarkdown(message: string) {
	let m = message;
	m = m.replace(/_/gi, `\_`);
	m = m.replace(/\*/gi, `\*`);
	m = m.replace(/~/gi, `\~`);
	m = m.replace(/||/gi, `\||`);
	return m;
};