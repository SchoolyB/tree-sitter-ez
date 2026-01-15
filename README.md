# tree-sitter-ez

Tree-sitter grammar for the [EZ programming language](https://github.com/SchoolyB/EZ).

## Usage

This grammar is used by [ez-syntax](https://github.com/SchoolyB/ez-syntax) for syntax highlighting in Zed.

## Updating the Grammar

### Prerequisites

```bash
npm install -g tree-sitter-cli
```

### Making Changes

1. Edit `grammar.js` to add/modify syntax rules

2. Regenerate the parser:
   ```bash
   tree-sitter generate
   ```

3. Test parsing (optional):
   ```bash
   tree-sitter parse path/to/file.ez
   ```

4. Commit and push:
   ```bash
   git add -A
   git commit -m "feat: description of change"
   git push
   ```

5. Update [ez-syntax](https://github.com/SchoolyB/ez-syntax) with the new commit SHA

## Structure

| File | Purpose |
|------|---------|
| `grammar.js` | Grammar definition (edit this) |
| `src/parser.c` | Generated parser (don't edit) |
| `src/node-types.json` | Generated node types (don't edit) |

## Related

- [EZ Programming Language](https://github.com/SchoolyB/EZ)
- [ez-syntax](https://github.com/SchoolyB/ez-syntax) - Zed extension using this grammar
