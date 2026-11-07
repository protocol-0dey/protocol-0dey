import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { describe, expect, it } from 'vitest';
import { createServer } from './server.js';
import { makeProject } from './test-utils.js';

async function connect(root: string) {
  const server = createServer(root);
  const client = new Client({ name: 'test-client', version: '1.0.0' });
  const [clientTransport, serverTransport] = InMemoryTransport.createLinkedPair();
  await Promise.all([server.connect(serverTransport), client.connect(clientTransport)]);
  return client;
}

const text = (result: unknown) =>
  (result as { content: { text: string }[] }).content[0]?.text ?? '';

describe('MCP server over the protocol', () => {
  it('lists four read-only tools and one prompt', async () => {
    const client = await connect(await makeProject({ 'package.json': '{}' }));
    const { tools } = await client.listTools();
    expect(tools.map((t) => t.name).sort()).toEqual([
      'component_inventory',
      'dependency_hygiene',
      'find_todos',
      'project_overview',
    ]);
    expect(tools.every((t) => t.annotations?.readOnlyHint === true)).toBe(true);
    const { prompts } = await client.listPrompts();
    expect(prompts.map((p) => p.name)).toEqual(['review_frontend_project']);
  });

  it('runs a tool and returns JSON text', async () => {
    const client = await connect(
      await makeProject({
        'package.json': '{"name":"x","dependencies":{"react":"^19.0.0"}}',
        'src/a.ts': '// TODO: x',
      }),
    );
    const overview = JSON.parse(
      text(await client.callTool({ name: 'project_overview', arguments: {} })),
    );
    expect(overview.name).toBe('x');
    const todos = JSON.parse(
      text(await client.callTool({ name: 'find_todos', arguments: { limit: 5 } })),
    );
    expect(todos.total).toBe(1);
  });

  it('refuses paths outside the root with an error result', async () => {
    const client = await connect(await makeProject({ 'package.json': '{}' }));
    const result = await client.callTool({
      name: 'project_overview',
      arguments: { path: '../../etc' },
    });
    expect(result.isError).toBe(true);
    expect(text(result)).toMatch(/outside the allowed root|does not exist/);
  });

  it('validates input with the schema', async () => {
    const client = await connect(await makeProject({ 'package.json': '{}' }));
    const result = await client
      .callTool({ name: 'find_todos', arguments: { limit: 9999 } })
      .catch((e: unknown) => e);
    const failed = result instanceof Error || (result as { isError?: boolean }).isError === true;
    expect(failed).toBe(true);
  });
});
