import { promises as fs } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { PathError, resolveInside } from './fs-safe.js';
import { makeProject, bigComponent } from './test-utils.js';
import { componentInventory } from './tools/components.js';
import { auditDependencies } from './tools/deps.js';
import { projectOverview } from './tools/overview.js';
import { findTodos } from './tools/todos.js';

const PKG = JSON.stringify({
  name: 'demo',
  version: '2.1.0',
  scripts: { dev: 'vite', test: 'vitest' },
  dependencies: {
    react: '^19.0.0',
    lodash: '*',
    vitest: '^3.0.0',
    'left-pad': 'github:user/left-pad',
  },
  devDependencies: { vite: '^7.0.0', typescript: '^5.0.0', vitest: '^3.0.0', tailwindcss: '>=3' },
});

describe('projectOverview', () => {
  it('detects stack and tooling', async () => {
    const dir = await makeProject({
      'package.json': PKG,
      'package-lock.json': '{}',
      'tsconfig.json': '{}',
      '.prettierrc': '{}',
      'README.md': '# demo',
    });
    const overview = await projectOverview(dir);
    expect(overview).toMatchObject({
      name: 'demo',
      version: '2.1.0',
      language: 'TypeScript',
      packageManager: 'npm',
      bundler: 'Vite',
    });
    expect(overview.frameworks).toContain('React');
    expect(overview.testRunners).toContain('Vitest');
    expect(overview.styling).toContain('Tailwind CSS');
    expect(overview.tooling).toMatchObject({ prettier: true, readme: true, ci: false });
  });

  it('reports a clear error when package.json is missing or invalid', async () => {
    await expect(projectOverview(await makeProject({ 'a.txt': 'x' }))).rejects.toThrow(
      /package.json/,
    );
    await expect(projectOverview(await makeProject({ 'package.json': '{oops' }))).rejects.toThrow(
      /valid JSON/,
    );
  });
});

describe('findTodos', () => {
  it('finds markers across comment styles with file and line', async () => {
    const dir = await makeProject({
      'src/a.ts': 'const a = 1;\n// TODO: handle errors\n/* FIXME broken */\n',
      'src/b.css': '/* HACK: ie11 */\n.a { color: red }\n',
      'src/c.html': '<!-- TODO add meta -->\n',
      'node_modules/pkg/index.js': '// TODO ignored\n',
    });
    const report = await findTodos(dir);
    expect(report.total).toBe(4);
    expect(report.byTag).toEqual({ TODO: 2, FIXME: 1, HACK: 1 });
    expect(report.items[0]).toEqual({
      file: 'src/a.ts',
      line: 2,
      tag: 'TODO',
      text: 'handle errors',
    });
    expect(report.items.some((i) => i.file.includes('node_modules'))).toBe(false);
  });

  it('respects the limit and says when it truncated', async () => {
    const dir = await makeProject({
      'src/a.ts': Array.from({ length: 10 }, () => '// TODO x').join('\n'),
    });
    const report = await findTodos(dir, 3);
    expect(report.items).toHaveLength(3);
    expect(report.total).toBe(10);
    expect(report.truncated).toBe(true);
  });
});

describe('auditDependencies', () => {
  it('flags risky ranges, duplicates and misplaced tools', async () => {
    const dir = await makeProject({ 'package.json': PKG });
    const report = await auditDependencies(dir);
    const byPackage = (name: string) => report.issues.filter((i) => i.package === name);
    expect(report.lockfile).toBeNull();
    expect(report.issues.some((i) => i.package === '(project)')).toBe(true);
    expect(byPackage('lodash')[0]?.severity).toBe('warning');
    expect(byPackage('left-pad')[0]?.issue).toMatch(/instead of the registry/);
    expect(
      byPackage('vitest').some((i) => /both dependencies and devDependencies/.test(i.issue)),
    ).toBe(true);
    expect(byPackage('tailwindcss')[0]?.issue).toMatch(/Open-ended/);
  });

  it('is quiet for a healthy project', async () => {
    const dir = await makeProject({
      'package.json': JSON.stringify({
        dependencies: { react: '^19.0.0' },
        devDependencies: { vite: '^7.0.0' },
      }),
      'pnpm-lock.yaml': '',
    });
    expect((await auditDependencies(dir)).issues).toEqual([]);
  });
});

describe('componentInventory', () => {
  it('lists components, skips tests and flags heavy files', async () => {
    const hooks = Array.from(
      { length: 6 },
      (_, i) => `const [s${i}, set${i}] = useState(${i});`,
    ).join('\n');
    const dir = await makeProject({
      'src/Big.tsx': bigComponent(250),
      'src/Heavy.tsx': `export function Heavy() {\n${hooks}\n  return null;\n}\n`,
      'src/Small.tsx': 'export const Small = () => null;\n',
      'src/Small.test.tsx': 'export function Test() {}\n',
      'src/util.ts': 'export function helper() {}\n',
    });
    const report = await componentInventory(dir);
    expect(report.totalComponents).toBe(3);
    expect(report.files[0]?.file).toBe('src/Big.tsx');
    expect(report.files[0]?.flags[0]).toMatch(/large file/);
    expect(report.files.find((f) => f.file === 'src/Heavy.tsx')?.flags[0]).toMatch(/6 useState/);
    expect(report.flagged).toBe(2);
  });
});

describe('resolveInside', () => {
  it('allows sub-folders and rejects escapes', async () => {
    const dir = await makeProject({ 'packages/web/package.json': '{}' });
    await expect(resolveInside(dir, 'packages/web')).resolves.toContain('packages');
    await expect(resolveInside(dir, '../')).rejects.toBeInstanceOf(PathError);
    await expect(resolveInside(dir, '/etc')).rejects.toBeInstanceOf(PathError);
    await expect(resolveInside(dir, 'missing')).rejects.toThrow(/does not exist/);
  });

  it('rejects a symlink that points outside the root', async () => {
    const outside = await makeProject({ 'secret.txt': 'x' });
    const dir = await makeProject({ 'a.txt': 'x' });
    await fs.symlink(outside, `${dir}/link`);
    await expect(resolveInside(dir, 'link')).rejects.toBeInstanceOf(PathError);
  });
});
