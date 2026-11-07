import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import { PathError, resolveInside } from './fs-safe.js';
import { componentInventory } from './tools/components.js';
import { auditDependencies } from './tools/deps.js';
import { projectOverview } from './tools/overview.js';
import { findTodos } from './tools/todos.js';

export const SERVER_NAME = 'project-insights';
export const SERVER_VERSION = '1.0.0';

const pathInput = z
  .string()
  .optional()
  .describe(
    'Sub-folder of the project root to inspect, for example "packages/web". Defaults to the root.',
  );

type ToolResult = { content: { type: 'text'; text: string }[]; isError?: boolean };

const ok = (data: unknown): ToolResult => ({
  content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
});
const fail = (error: unknown): ToolResult => ({
  isError: true,
  content: [
    {
      type: 'text',
      text:
        error instanceof PathError || error instanceof Error ? error.message : 'Unexpected error.',
    },
  ],
});

/**
 * Builds the MCP server. `root` is the only directory the tools may read: every request is
 * resolved against it and rejected if it escapes (`..`, absolute paths or symlinks).
 * All tools are read-only and make no network calls.
 */
export function createServer(root: string): McpServer {
  const server = new McpServer({ name: SERVER_NAME, version: SERVER_VERSION });
  const readOnly = {
    readOnlyHint: true,
    destructiveHint: false,
    idempotentHint: true,
    openWorldHint: false,
  };

  server.registerTool(
    'project_overview',
    {
      title: 'Project overview',
      description:
        'Summarises a JavaScript/TypeScript project from package.json and config files: language, frameworks, bundler, test runners, styling, scripts and tooling.',
      inputSchema: { path: pathInput },
      annotations: readOnly,
    },
    async ({ path }) => {
      try {
        return ok(await projectOverview(await resolveInside(root, path)));
      } catch (error) {
        return fail(error);
      }
    },
  );

  server.registerTool(
    'find_todos',
    {
      title: 'Find TODO comments',
      description:
        'Lists TODO, FIXME, HACK and XXX comments in source files with file, line and text, plus counts per tag.',
      inputSchema: {
        path: pathInput,
        limit: z
          .number()
          .int()
          .min(1)
          .max(200)
          .optional()
          .describe('Maximum number of items to return (default 50).'),
      },
      annotations: readOnly,
    },
    async ({ path, limit }) => {
      try {
        return ok(await findTodos(await resolveInside(root, path), limit));
      } catch (error) {
        return fail(error);
      }
    },
  );

  server.registerTool(
    'dependency_hygiene',
    {
      title: 'Dependency hygiene check',
      description:
        'Offline check of package.json: missing lockfile, wildcard or git versions, open-ended ranges, duplicates between dependencies and devDependencies, build tools in dependencies. Does not check for vulnerabilities.',
      inputSchema: { path: pathInput },
      annotations: readOnly,
    },
    async ({ path }) => {
      try {
        return ok(await auditDependencies(await resolveInside(root, path)));
      } catch (error) {
        return fail(error);
      }
    },
  );

  server.registerTool(
    'component_inventory',
    {
      title: 'React component inventory',
      description:
        'Finds exported React components in .tsx/.jsx files and flags large files and heavy hook usage (many useState or useEffect calls). Heuristic, regex based.',
      inputSchema: {
        path: pathInput,
        minLines: z
          .number()
          .int()
          .min(20)
          .max(2000)
          .optional()
          .describe('Flag files longer than this (default 200).'),
        limit: z
          .number()
          .int()
          .min(1)
          .max(100)
          .optional()
          .describe('Number of files to return, largest first (default 20).'),
      },
      annotations: readOnly,
    },
    async ({ path, minLines, limit }) => {
      try {
        return ok(await componentInventory(await resolveInside(root, path), { minLines, limit }));
      } catch (error) {
        return fail(error);
      }
    },
  );

  server.registerPrompt(
    'review_frontend_project',
    {
      title: 'Review a frontend project',
      description:
        'Asks the assistant to gather facts with the project tools and write a short, prioritised review.',
    },
    () => ({
      messages: [
        {
          role: 'user',
          content: {
            type: 'text',
            text: [
              'Review this frontend project. Work in this order:',
              '1. Call project_overview to learn the stack and tooling.',
              '2. Call dependency_hygiene and component_inventory.',
              '3. Call find_todos.',
              'Then write a review with: stack summary (2 lines), the 3 most important risks, and a prioritised list of next steps.',
              'Only state facts that come from the tool results. If a tool returned truncated data, say so.',
            ].join('\n'),
          },
        },
      ],
    }),
  );

  return server;
}
