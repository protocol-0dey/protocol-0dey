// End-to-end check: starts the built server as a child process over stdio, exactly like an
// MCP client (Claude Desktop, Claude Code) would, and calls every tool against a real project.
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(process.argv[2] ?? path.join(here, '..'));
const transport = new StdioClientTransport({
  command: 'node',
  args: [path.join(here, '..', 'dist', 'index.js'), '--root', root],
});
const client = new Client({ name: 'smoke', version: '1.0.0' });
await client.connect(transport);

const { tools } = await client.listTools();
console.log('tools:', tools.map((t) => t.name).join(', '));
for (const name of [
  'project_overview',
  'dependency_hygiene',
  'component_inventory',
  'find_todos',
]) {
  const result = await client.callTool({ name, arguments: {} });
  const data = JSON.parse(result.content[0].text);
  console.log(`\n== ${name} ==`);
  console.log(JSON.stringify(data, null, 1).split('\n').slice(0, 24).join('\n'));
}
const bad = await client.callTool({ name: 'project_overview', arguments: { path: '../..' } });
console.log('\npath escape ->', bad.isError ? 'blocked' : 'NOT BLOCKED', '|', bad.content[0].text);
await client.close();
