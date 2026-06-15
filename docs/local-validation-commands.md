# Local Validation Commands

Run these commands after pulling the latest changes.

```bash
npm install
npm run typecheck
npm test
npm run build
```

Then validate with MCP inspector:

```bash
npx @modelcontextprotocol/inspector node dist/index.js
```

Check for stdout pollution:

```bash
grep -R "console.log" src
```

Runtime code should not write diagnostics to stdout.
