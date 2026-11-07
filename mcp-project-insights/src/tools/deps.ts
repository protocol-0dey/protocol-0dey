import path from 'node:path';
import { exists, readTextFile } from '../fs-safe.js';

export type Severity = 'warning' | 'info';

export interface DependencyIssue {
  severity: Severity;
  package: string;
  issue: string;
  suggestion: string;
}

export interface DependencyReport {
  lockfile: string | null;
  totals: { dependencies: number; devDependencies: number };
  issues: DependencyIssue[];
}

interface PackageJson {
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
}

const LOCKFILES = ['package-lock.json', 'pnpm-lock.yaml', 'yarn.lock', 'bun.lockb'];
const DEV_ONLY =
  /^(@types\/|eslint|prettier|vitest|jest|@testing-library\/|typescript$|@vitejs\/|vite$)/;

/** Offline dependency hygiene check. It does not look up vulnerabilities, so it never needs the network. */
export async function auditDependencies(dir: string): Promise<DependencyReport> {
  const raw = await readTextFile(path.join(dir, 'package.json'));
  if (raw === null) throw new Error('package.json was not found or is too large.');
  const pkg = JSON.parse(raw) as PackageJson;
  const deps = pkg.dependencies ?? {};
  const devDeps = pkg.devDependencies ?? {};
  const issues: DependencyIssue[] = [];

  let lockfile: string | null = null;
  for (const name of LOCKFILES) {
    if (await exists(path.join(dir, name))) {
      lockfile = name;
      break;
    }
  }
  if (!lockfile) {
    issues.push({
      severity: 'warning',
      package: '(project)',
      issue: 'No lockfile found, so installs are not reproducible.',
      suggestion: 'Commit package-lock.json, pnpm-lock.yaml or yarn.lock.',
    });
  }

  for (const [name, range] of [...Object.entries(deps), ...Object.entries(devDeps)]) {
    if (range === '*' || range === 'latest' || range === '') {
      issues.push({
        severity: 'warning',
        package: name,
        issue: `Version range "${range || '(empty)'}" accepts any release, including breaking ones.`,
        suggestion: 'Pin to a caret range such as ^1.2.3.',
      });
    } else if (/^(git|github:|https?:|file:|link:)/.test(range)) {
      issues.push({
        severity: 'warning',
        package: name,
        issue: `Installed from "${range}" instead of the registry.`,
        suggestion: 'Prefer a published version, or document why this one is needed.',
      });
    } else if (/^>=?\s*\d/.test(range)) {
      issues.push({
        severity: 'info',
        package: name,
        issue: `Open-ended range "${range}" has no upper bound.`,
        suggestion: 'Use a caret (^) or tilde (~) range.',
      });
    }
  }

  for (const name of Object.keys(deps)) {
    if (name in devDeps) {
      issues.push({
        severity: 'warning',
        package: name,
        issue: 'Listed in both dependencies and devDependencies.',
        suggestion: 'Keep it in one place.',
      });
    } else if (DEV_ONLY.test(name)) {
      issues.push({
        severity: 'info',
        package: name,
        issue: 'Looks like a build/test tool but is in dependencies.',
        suggestion: 'Move it to devDependencies unless the app imports it at runtime.',
      });
    }
  }

  return {
    lockfile,
    totals: {
      dependencies: Object.keys(deps).length,
      devDependencies: Object.keys(devDeps).length,
    },
    issues,
  };
}
