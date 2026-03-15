export function defineBackground(entrypoint) {
	if (typeof entrypoint === 'function') {
		entrypoint();
		return entrypoint;
	}

	if (entrypoint?.main) {
		entrypoint.main();
	}

	return entrypoint;
}

export function defineContentScript(entrypoint) {
	return entrypoint;
}
