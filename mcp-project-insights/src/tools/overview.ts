import path from 'node:path';
import { exists, readTextFile } from '../fs-safe.js';

export interface ProjectOverview {
  name: string | null;
  version: string | null;
  packageManager: 'npm' | 'pnpm' | 'yarn' | 'bun' | 'unknown';
  language: 'TypeScript' | 'JavaScript';
  frameworks: string[];
  bundler: string | null;
  testRunners: string[];
  styling: string[];
  scripts: Record<string, string>;
  dependencyCount: number;
  devDependencyCount: number;
  tooling: { eslint: boolean; prettier: boolean; ci: boolean; readme: boolean };
}

interface PackageJson {
  name?: string;
  version?: string;
  scripts?: Record<string, string>;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  packageManager?: string;
}

const FRAMEWORKS: [string, string][] = [
  ['next', 'Next.js'],
  ['nuxt', 'Nuxt'],
  ['@sveltejs/kit', 'SvelteKit'],
  ['react', 'React'],
  ['vue', 'Vue'],
  ['svelte', 'Svelte'],
  ['@angular/core', 'Angular'],
  ['solid-js', 'SolidJS'],
  ['express', 'Express'],
  ['fastify', 'Fastify'],
  ['@nestjs/core', 'NestJS'],
];
const BUNDLERS: [string, string][] = [
  ['vite', 'Vite'],
  ['webpack', 'webpack'],
  ['esbuild', 'esbuild'],
  ['rollup', 'Rollup'],
  ['parcel', 'Parcel'],
  ['@rspack/core', 'Rspack'],
];
const TEST_RUNNERS: [string, string][] = [
  ['vitest', 'Vitest'],
  ['jest', 'Jest'],
  ['@playwright/test', 'Playwright'],
  ['cypress', 'Cypress'],
  ['@testing-library/react', 'Testing Library'],
];
const STYLING: [string, string][] = [
  ['tailwindcss', 'Tailwind CSS'],
  ['styled-components', 'styled-components'],
  ['@emotion/react', 'Emotion'],
  ['sass', 'Sass'],
  ['@mui/material', 'MUI'],
];

export async function projectOverview(dir: string): Promise<ProjectOverview> {
  const raw = await readTextFile(path.join(dir, 'package.json'));
  if (raw === null) throw new Error('package.json was not found or is too large.');
  let pkg: PackageJson;
  try {
    pkg = JSON.parse(raw) as PackageJson;
  } catch {
    throw new Error('package.json is not valid JSON.');
  }

  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const has = (name: string) => name in deps;
  const found = (list: [string, string][]) =>
    list.filter(([key]) => has(key)).map(([, label]) => label);

  const [
    pnpm,
    yarn,
    bun,
    npm,
    tsconfig,
    eslintFlat,
    eslintRc,
    prettierRc,
    prettierCfg,
    ci,
    readme,
  ] = await Promise.all([
    exists(path.join(dir, 'pnpm-lock.yaml')),
    exists(path.join(dir, 'yarn.lock')),
    exists(path.join(dir, 'bun.lockb')),
    exists(path.join(dir, 'package-lock.json')),
    exists(path.join(dir, 'tsconfig.json')),
    exists(path.join(dir, 'eslint.config.js')),
    exists(path.join(dir, '.eslintrc.json')),
    exists(path.join(dir, '.prettierrc')),
    exists(path.join(dir, 'prettier.config.js')),
    exists(path.join(dir, '.github', 'workflows')),
    exists(path.join(dir, 'README.md')),
  ]);

  const declared = pkg.packageManager?.split('@')[0];
  const packageManager: ProjectOverview['packageManager'] = pnpm
    ? 'pnpm'
    : yarn
      ? 'yarn'
      : bun
        ? 'bun'
        : npm
          ? 'npm'
          : declared === 'pnpm' || declared === 'yarn' || declared === 'bun' || declared === 'npm'
            ? declared
            : 'unknown';

  const frameworks = found(FRAMEWORKS);

  return {
    name: pkg.name ?? null,
    version: pkg.version ?? null,
    packageManager,
    language: tsconfig || has('typescript') ? 'TypeScript' : 'JavaScript',
    frameworks,
    bundler: found(BUNDLERS)[0] ?? null,
    testRunners: found(TEST_RUNNERS),
    styling: found(STYLING),
    scripts: pkg.scripts ?? {},
    dependencyCount: Object.keys(pkg.dependencies ?? {}).length,
    devDependencyCount: Object.keys(pkg.devDependencies ?? {}).length,
    tooling: {
      eslint: eslintFlat || eslintRc || has('eslint'),
      prettier: prettierRc || prettierCfg || has('prettier'),
      ci,
      readme,
    },
  };
}
