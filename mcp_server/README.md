# @lpenguin/godot-mcp

An MCP (Model Context Protocol) server that generates valid Godot ResourceUID strings by communicating with a running Godot Editor instance via TCP.

## Installation

### Via NPX (Recommended)

```bash
npx @lpenguin/godot-mcp
```

### Global Installation

```bash
npm install -g @lpenguin/godot-mcp
godot-mcp
```

## Prerequisites

1. **Godot Editor 4.x** must be running
2. **MCP Bridge plugin** must be installed and enabled in your Godot project

### Installing the Godot Plugin

1. Download the `lpenguin-mcp-server` folder from the [repository](https://github.com/lpenguin/godot-mcp)
2. Copy it to your Godot project's `addons/` directory
3. Enable the plugin in **Project > Project Settings > Plugins**

## Usage

### With Claude Desktop

Add to your Claude Desktop configuration file:

**macOS**: `~/Library/Application Support/Claude/claude_desktop_config.json`

**Windows**: `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "godot": {
      "command": "npx",
      "args": ["@lpenguin/godot-mcp"]
    }
  }
}
```

Restart Claude Desktop. You can now ask Claude to generate Godot UIDs:

```
"Generate a new Godot ResourceUID for my resource"
```

### With Other MCP Clients

The server implements the MCP protocol and provides a single tool:

**Tool**: `generate_godot_uid`

**Description**: Generate a new Godot ResourceUID string

**Input**: No parameters required

**Output**: A valid Godot UID string (e.g., `uid://dmbxm1qp5555x`)

## How It Works

1. The MCP server connects to `localhost:8085` via TCP
2. Sends a JSON command: `{"command": "get_new_uid"}`
3. The Godot plugin receives the command and executes:
   ```gdscript
   var new_id = ResourceUID.create_id()
   var uid_string = ResourceUID.id_to_text(new_id)
   ```
4. Returns the UID to the MCP server
5. The MCP server returns it to the AI agent

## Error Handling

The server provides user-friendly error messages:

- **Connection refused**: "Cannot connect to Godot Editor. Please open Godot Editor with the MCP Bridge plugin enabled."
- **Timeout**: "Connection timeout. Make sure Godot Editor is running with the MCP Bridge plugin enabled."
- **Malformed response**: "Failed to parse response from Godot"

## Configuration

Default settings:
- **Host**: `localhost`
- **Port**: `8085`
- **Timeout**: `2000ms`

To customize, modify the `GodotClient` instantiation in `src/index.ts`.

## Troubleshooting

### "Cannot connect to Godot Editor"

1. Ensure Godot Editor is running
2. Verify the MCP Bridge plugin is enabled
3. Check that no firewall is blocking port 8085

### "Connection timeout"

1. Godot Editor might be frozen or busy
2. Try restarting Godot Editor
3. Increase the timeout in the client configuration

### Verifying the Plugin

Check the Godot console for:
```
[MCP Bridge] TCP Server started on port 8085
```

## Development

See the [main repository](https://github.com/lpenguin/godot-mcp) for development instructions.

## License

MIT

## Links

- [GitHub Repository](https://github.com/lpenguin/godot-mcp)
- [NPM Package](https://www.npmjs.com/package/@lpenguin/godot-mcp)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Godot Engine](https://godotengine.org/)
