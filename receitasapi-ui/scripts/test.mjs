import { spawnSync } from 'node:child_process';

const rawArgs = process.argv.slice(2);
const wantsCoverage = rawArgs.includes('--code-coverage');
const args = rawArgs.filter((arg) => arg !== '--code-coverage' && arg !== '--watch=false');
const finalArgs = ['ng', 'test', '--watch=false'];

if (wantsCoverage) {
  finalArgs.push('--configuration', 'coverage');
}

finalArgs.push(...args);

const result = spawnSync('npx', finalArgs, { stdio: 'inherit', shell: true });

process.exit(result.status ?? 1);
