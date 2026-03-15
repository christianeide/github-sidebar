/* 
Time has in versions before v4 been saved in seconds.
After v4 all time is saved in ms. Minimum ms to save is one mine, aka 60 000ms. 
We will treat all values below 60 000 as old values in seconds
*/
const msInMinute = 60000;
export const MINIMUMREFRESHPERIOD = msInMinute;
const minValue = 1;

export function convertMsToSec(ms) {
	// if ms is belov seecondsthreshold, we treat the value as seconds, if not as ms
	let min =
		ms < MINIMUMREFRESHPERIOD ? Math.floor(ms / 60) : Math.floor(ms / 60000);
	return min > minValue ? min : minValue;
}

export function convertSecToMs(sec) {
	const ms = sec * msInMinute;

	// Make sure we dont return values below minimum refresh period
	return ms > MINIMUMREFRESHPERIOD ? ms : MINIMUMREFRESHPERIOD;
}
