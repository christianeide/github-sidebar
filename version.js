const fs = require('fs');
const semver = require('semver');
const execSync = require('child_process').execSync;

function getProcessArgs() {
	return process.argv.slice(2).reduce((args, arg) => {
		const [key, value = true] = arg.split('=');
		args[key.replace(/^-*/g, '')] = value;
		return args;
	}, {});
}

function getBump(args) {
	if (args.major) {
		return 'major';
	}
	if (args.minor) {
		return 'minor';
	}
	if (args.patch) {
		return 'patch';
	}

	console.log(
		'No bump-level specified, bumping up a patch! Supply version bump with "npm run version patch/minor/major"'
	);
	return 'patch';
}

function readFileSync(path) {
	const pckgRaw = fs.readFileSync(path);
	return JSON.parse(pckgRaw);
}

function writeFileSync(path, data) {
	fs.writeFileSync(path, JSON.stringify(data, null, 2) + '\n');
}

function bumpVersion(path, newVersion) {
	const file = readFileSync(path);
	file.version = newVersion;
	writeFileSync(path, file);
}

const args = getProcessArgs();
const bump = getBump(args);

// Make sure all files have the same version number, use package.json
const currentVersion = readFileSync('package.json').version;
const newVersion = semver.inc(currentVersion, bump);

bumpVersion('package.json', newVersion);
bumpVersion('package-lock.json', newVersion);
bumpVersion('manifest.json', newVersion);

console.log('Version bumped to ' + newVersion);
console.log('Building files');

execSync('npm run build');

console.log('Finished building project');
