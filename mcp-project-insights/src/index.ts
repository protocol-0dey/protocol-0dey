#!/usr/bin/env node
import path from 'node:path';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from './server.js';

function parseRoot(argv: string[]): string {
  const flag = argv.indexOf('--root');
  const value = flag !== -1 ? argv[flag + 1] : undefined;
  return path.resolve(value ?? process.cwd());
}

async function main() {
  const root = parseRoot(process.argv.slice(2));
  const server = createServer(root);
  await server.connect(new StdioServerTransport());
  // stdout carries the protocol, so diagnostics must go to stderr.
  console.error(`project-insights MCP server ready, root: ${root}`);
}

main().catch((error: unknown) => {
  console.error('Failed to start:', error);
  process.exit(1);
});
