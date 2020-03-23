export function isSelectedURL(itemURL) {
	const currentURL = getCurrentURL();
	return currentURL.startsWith(`${itemURL}/`) ? 'selected' : '';
}

function getCurrentURL() {
	return `${window.location.href}/`;
}
