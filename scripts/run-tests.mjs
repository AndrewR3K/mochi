import { glob } from 'glob';
import { spawnSync } from 'node:child_process';

const files = await glob('packages/**/test/**/*.test.ts');

if (!files.length) {
  console.error('No test files found');
  process.exit(1);
}

const result = spawnSync(
  'node',
  ['--import', 'tsx', '--test', ...files],
  { stdio: 'inherit' }
);

process.exit(result.status);
