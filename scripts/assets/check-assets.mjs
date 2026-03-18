import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');
const manifestsDir = path.join(projectRoot, 'src', 'shared', 'config', 'assets', 'manifests');
const publicDir = path.join(projectRoot, 'public');
const allowedExtensions = new Set(['.png', '.jpg', '.jpeg', '.webp', '.svg', '.mp3', '.ogg', '.wav']);
const requiredOptionalKeys = new Set(['bg_battle', 'bg_city']);

const errors = [];

const pushError = (message) => {
  errors.push(message);
};

const ensureFileExists = async (filePath) => {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
};

const loadManifestEntries = async () => {
  const files = await readdir(manifestsDir);
  const manifestFiles = files.filter((file) => file.endsWith('.json')).sort();
  if (manifestFiles.length === 0) {
    throw new Error('No manifest json files found in assets/manifests');
  }
  const entriesByFile = await Promise.all(
    manifestFiles.map(async (file) => {
    const filePath = path.join(manifestsDir, file);
    const raw = await readFile(filePath, 'utf8');
    const manifest = JSON.parse(raw);
    if (!Array.isArray(manifest)) {
      throw new TypeError(`${file} must be an array`);
    }
      return manifest;
    })
  );
  return entriesByFile.flat();
};

const validateAsset = async (asset, index, seenKeys) => {
  const prefix = `Entry #${index + 1}`;
  if (!asset || typeof asset !== 'object') {
    pushError(`${prefix}: invalid object`);
    return;
  }

  const key = typeof asset.key === 'string' ? asset.key.trim() : '';
  const url = typeof asset.url === 'string' ? asset.url.trim() : '';
  const type = typeof asset.type === 'string' ? asset.type.trim() : '';
  const feature = typeof asset.feature === 'string' ? asset.feature.trim() : '';
  const optional = asset.optional;

  if (!key) {
    pushError(`${prefix}: key is required`);
  } else if (seenKeys.has(key)) {
    pushError(`${prefix}: duplicated key "${key}"`);
  } else {
    seenKeys.add(key);
  }

  if (!url.startsWith('/')) {
    pushError(`${prefix}: url must start with "/"`);
  }

  const ext = path.extname(url).toLowerCase();
  if (!allowedExtensions.has(ext)) {
    pushError(`${prefix}: unsupported extension "${ext || 'none'}"`);
  }

  if (type !== 'image' && type !== 'audio') {
    pushError(`${prefix}: type must be "image" or "audio"`);
  }

  if (!feature) {
    pushError(`${prefix}: feature is required`);
  }

  if (typeof optional !== 'boolean') {
    pushError(`${prefix}: optional must be boolean`);
  }

  if (requiredOptionalKeys.has(key) && optional !== true) {
    pushError(`${prefix}: ${key} must set optional=true`);
  }

  if (url.startsWith('/')) {
    const relativePath = url.replace(/^\/+/, '');
    const absolutePath = path.join(publicDir, relativePath);
    const exists = await ensureFileExists(absolutePath);
    if (!exists) {
      pushError(`${prefix}: file not found at public/${relativePath}`);
    }
  }
};

const run = async () => {
  const manifest = await loadManifestEntries();

  const seenKeys = new Set();
  await Promise.all(manifest.map((asset, index) => validateAsset(asset, index, seenKeys)));

  if (errors.length > 0) {
    console.error('Asset check failed:');
    errors.forEach((error) => {
      console.error(`- ${error}`);
    });
    process.exitCode = 1;
    return;
  }

  console.log(`Asset check passed: ${manifest.length} assets validated.`);
};

try {
  await run();
} catch (error) {
  console.error('Asset check failed with runtime error:');
  console.error(error instanceof Error ? error.message : String(error));
  process.exitCode = 1;
}
