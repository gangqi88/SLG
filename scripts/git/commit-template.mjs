import { generateCommitTemplate } from './commit-conventions.mjs';

const args = process.argv.slice(2);
const interactive = !args.includes('--non-interactive');
const out = await generateCommitTemplate({ interactive });
process.stdout.write(out + '\n');

