import { spawn } from 'node:child_process';
import { setTimeout as delay } from 'node:timers/promises';

const npmCmd = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const port = process.env.PORT || '8080';
const url = `http://localhost:${port}/`;
const timeoutMs = Number(process.env.E2E_WAIT_TIMEOUT_MS || 60_000);

const waitForServer = async () => {
  const startAt = Date.now();
  while (Date.now() - startAt < timeoutMs) {
    try {
      const res = await fetch(url, { method: 'GET' });
      if (res.ok) return;
    } catch {
      await delay(500);
      continue;
    }
    await delay(500);
  }
  throw new Error(`Server not ready: ${url}`);
};

const spawnAsync = (command, args, options) =>
  new Promise((resolve) => {
    const child = spawn(command, args, options);
    child.on('exit', (code) => resolve(code ?? 1));
  });

const devServer = spawn(npmCmd, ['run', 'dev', '--', '--port', port, '--strictPort'], {
  stdio: 'inherit',
  shell: true,
});

try {
  await waitForServer();
  const exitCode = await spawnAsync(npmCmd, ['run', 'cy:run'], { stdio: 'inherit', shell: true });
  devServer.kill();
  process.exit(exitCode);
} catch (err) {
  devServer.kill();
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
}
