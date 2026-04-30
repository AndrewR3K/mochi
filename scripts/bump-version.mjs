import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import process from 'node:process';

const args = parseArgs(process.argv.slice(2));
const root = process.cwd();
const packageFiles = await findVersionedPackageFiles();
const rootPackagePath = join(root, 'package.json');
const rootPackage = await readJson(rootPackagePath);
const currentVersion = rootPackage.version;

if (!currentVersion) {
  fail('Root package.json must define a version.');
}

if (args.check) {
  const mismatches = [];
  for (const file of packageFiles) {
    const manifest = await readJson(file);
    if (manifest.version !== currentVersion) {
      mismatches.push(`${relative(file)} has ${manifest.version}, expected ${currentVersion}`);
    }
  }

  if (mismatches.length > 0) {
    fail(`Package versions are out of sync:\n${mismatches.join('\n')}`);
  }

  console.log(`All package versions are synced at ${currentVersion}.`);
  process.exit(0);
}

const nextVersion = args.version || bumpVersion(currentVersion, args.bump || 'patch');
validateVersion(nextVersion);

if (nextVersion === currentVersion) {
  fail(`Next version must be different from the current version (${currentVersion}).`);
}

for (const file of [rootPackagePath, ...packageFiles]) {
  const manifest = await readJson(file);
  if (!manifest.version) {
    continue;
  }

  manifest.version = nextVersion;
  await writeJson(file, manifest);
}

console.log(`Updated package versions: ${currentVersion} -> ${nextVersion}`);

function parseArgs(argv) {
  const parsed = {};

  for (let index = 0; index < argv.length; index++) {
    const arg = argv[index];

    if (arg === '--') {
      continue;
    }

    if (arg === '--check') {
      parsed.check = true;
      continue;
    }

    if (arg === '--version') {
      parsed.version = argv[++index]?.trim();
      continue;
    }

    if (arg === '--bump') {
      parsed.bump = argv[++index]?.trim();
      continue;
    }

    fail(`Unknown argument: ${arg}`);
  }

  if (parsed.version === '') {
    delete parsed.version;
  }

  return parsed;
}

async function findVersionedPackageFiles() {
  const packagesDir = join(root, 'packages');
  const packageNames = await readdir(packagesDir);
  const files = [];

  for (const packageName of packageNames) {
    const packagePath = join(packagesDir, packageName, 'package.json');
    const manifest = await readJson(packagePath);

    if (manifest.version) {
      files.push(packagePath);
    }
  }

  return files.sort();
}

function bumpVersion(version, bump) {
  validateVersion(version);

  if (bump === 'alpha' || bump === 'beta' || bump === 'rc') {
    return bumpPrerelease(version, bump);
  }

  const { major, minor, patch } = parseVersion(version);

  if (bump === 'major') {
    return `${major + 1}.0.0`;
  }

  if (bump === 'minor') {
    return `${major}.${minor + 1}.0`;
  }

  if (bump === 'patch') {
    return `${major}.${minor}.${patch + 1}`;
  }

  fail(`Unsupported bump type: ${bump}. Use alpha, beta, rc, major, minor, or patch.`);
}

function validateVersion(version) {
  if (!/^\d+\.\d+\.\d+(?:-(?:alpha|beta|rc)\.\d+)?$/.test(version)) {
    fail(`Invalid version: ${version}`);
  }
}

function bumpPrerelease(version, preid) {
  const parsed = parseVersion(version);

  if (!parsed.preid) {
    return `${parsed.major}.${parsed.minor + 1}.0-${preid}.0`;
  }

  if (parsed.preid === preid) {
    return `${parsed.major}.${parsed.minor}.${parsed.patch}-${preid}.${parsed.prerelease + 1}`;
  }

  return `${parsed.major}.${parsed.minor}.${parsed.patch}-${preid}.0`;
}

function parseVersion(version) {
  const match = /^(\d+)\.(\d+)\.(\d+)(?:-(alpha|beta|rc)\.(\d+))?$/.exec(version);

  if (!match) {
    fail(`Unsupported version format: ${version}`);
  }

  return {
    major: Number(match[1]),
    minor: Number(match[2]),
    patch: Number(match[3]),
    preid: match[4],
    prerelease: match[5] ? Number(match[5]) : 0,
  };
}

async function readJson(file) {
  return JSON.parse(await readFile(file, 'utf8'));
}

async function writeJson(file, value) {
  await writeFile(file, `${JSON.stringify(value, null, 2)}\n`);
}

function relative(file) {
  return file.replace(`${root}\\`, '').replace(`${root}/`, '');
}

function fail(message) {
  console.error(message);
  process.exit(1);
}
