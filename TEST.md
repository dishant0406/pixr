# TEST

## Scope

This CLI keeps network-dependent code behind a small Gemini client wrapper and tests the rest locally:

- config discovery from home-directory files
- saved default model discovery from `~/.pixr/config.json`
- instruction/style prompt assembly
- reference-image detection
- CLI JSON output
- API model listing with a fake Gemini client
- end-to-end generation flow with a fake Gemini client
- local resize and output-format conversion after generation

## Commands

Run the automated test suite:

```bash
npm test
```

Validate the installable command locally:

```bash
npm link
pixr --help
```

Run a real request:

```bash
export PIXR_API_KEY=your_gemini_key
pixr generate "A cinematic product shot of a brass fountain pen"
```

## Test hook

`PIXR_CLIENT_MODULE` lets the CLI load a fake client for tests so e2e coverage does not need network access.
