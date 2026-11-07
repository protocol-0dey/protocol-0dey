# mcp-project-insights

A small, read-only [Model Context Protocol](https://modelcontextprotocol.io) server that lets an AI assistant (Claude, or any MCP client) get a fast, factual overview of a JavaScript / TypeScript project instead of guessing from a few pasted files.

Built with the official TypeScript SDK. No network access, no writes, no shell.

## Tools

| Tool                  | What it returns                                                                                                        |
| --------------------- | ---------------------------------------------------------------------------------------------------------------------- |
| `project_overview`    | Language, frameworks, bundler, test runners, styling, scripts, package manager, tooling (ESLint, Prettier, CI, README) |
| `find_todos`          | `TODO` / `FIXME` / `HACK` / `XXX` comments with file, line and text, plus counts per tag                               |
| `dependency_hygiene`  | Missing lockfile, `*` / `latest` / git versions, open-ended ranges, duplicates, build tools in `dependencies`          |
| `component_inventory` | Exported React components per file, large files, heavy `useState` / `useEffect` usage                                  |

There is also one prompt, `review_frontend_project`, which tells the assistant to call the tools in a sensible order and write a short, prioritised review using only facts from the results.

All tools accept an optional `path` (a sub-folder, handy for monorepos) and return JSON text.

## Safety by design

- **One root.** The server reads only inside `--root` (default: the current directory). Every path is resolved with `realpath` and rejected if it leaves the root through `..`, an absolute path or a symlink.
- **Read-only.** Every tool is annotated `readOnlyHint: true`; the code has no write or exec paths.
- **Bounded work.** `node_modules`, `dist`, `.git` and similar folders are skipped; at most 5,000 files and 512 KB per file are read; results are limited and flagged `truncated` when cut.
- **Offline.** `dependency_hygiene` checks package.json hygiene only. It does not look up vulnerabilities.
- **stdout is the protocol.** Logs go to stderr only.

## Use it

```bash
npm install
npm run build
```

Claude Code:

```bash
claude mcp add project-insights -- node /absolute/path/to/mcp-project-insights/dist/index.js --root .
```

Claude Desktop (`claude_desktop_config.json`):

```json
{
  "mcpServers": {
    "project-insights": {
      "command": "node",
      "args": [
        "/absolute/path/to/mcp-project-insights/dist/index.js",
        "--root",
        "/path/to/your/project"
      ]
    }
  }
}
```

Then ask: _"Use the project-insights tools to review this project."_

## How it is tested

- **Unit tests** for each tool on throwaway fixture projects, including path traversal and symlink escapes.
- **Protocol tests** with the SDK client and an in-memory transport: tool listing, a real call, schema validation, refused paths.
- **Smoke test** (`npm run smoke -- <project>`): starts the built server as a child process over stdio, exactly like a real client, and calls every tool.

```bash
npm test
npm run typecheck
npm run build && npm run smoke -- ../pulse
```

## Limits

`component_inventory` is regex based: it is a triage tool, not a parser, and can miss components that are not exported with `export function|const|class`. The tool set is intentionally small; new tools go in `src/tools/` and are registered in `src/server.ts`.

## License

MIT
