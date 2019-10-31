const fs = require('fs')
const semver = require('semver')

const args = getProcessArgs()

function getProcessArgs () {
  return process.argv.slice(2).reduce((args, arg) => {
    const [key, value = true] = arg.split('=')
    args[key.replace(/^-*/g, '')] = value
    return args
  }, {})
}

function readFileSync (path) {
  const pckgRaw = fs.readFileSync(path)
  return JSON.parse(pckgRaw)
}

function writeFileSync (path, data) {
  fs.writeFileSync(path, JSON.stringify(data, null, 2))
}

function bumpVersion (path, newVersion) {
  const file = readFileSync(path)
  file.version = newVersion
  writeFileSync(path, file)
}

// Make sure all files have the same version number, use package.json
const currentVersion = readFileSync('package.json').version
const newVersion = semver.inc(currentVersion, args.version)

bumpVersion('package.json', newVersion)
bumpVersion('package-lock.json', newVersion)
bumpVersion('manifest.json', newVersion)

console.log('Version bumped to ' + newVersion)
