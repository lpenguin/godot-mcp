# Godot ResourceUID MCP Server & Plugin

A monorepo containing a Godot 4 Editor Plugin and a TypeScript MCP (Model Context Protocol) Server that allows AI agents to generate valid Godot `uid://` strings by communicating with a running Godot Editor instance via TCP.

## 📦 Repository Structure

```text
/
├── godot_plugin/       # Godot 4 Addon
│   └── addons/
│       └── lpenguin-mcp-server/
│           ├── plugin.cfg
│           └── mcp_bridge.gd
├── mcp_server/         # TypeScript MCP Server (Published to NPM)
│   ├── src/
│   ├── tests/
│   └── package.json
├── package.json        # Root workspace config
└── .github/workflows/  # Publishing Workflow
```

## 🚀 Quick Start

### 1. Install the Godot Plugin

1. Copy the `godot_plugin/addons/lpenguin-mcp-server/` folder into your Godot project's `addons/` directory
2. Open your Godot project
3. Go to **Project > Project Settings > Plugins**
4. Enable the **MCP Bridge** plugin
5. The TCP server will start automatically on port **8085**

### 2. Use the MCP Server

The MCP server can be run via `npx` without installation:

```bash
npx @lpenguin/godot-mcp
```

Or install it globally:

```bash
npm install -g @lpenguin/godot-mcp
godot-mcp
```

## 🔧 How It Works

### Godot Plugin (TCP Server)

The Godot plugin creates a TCP server that listens on port 8085 for JSON commands:

**Request Format:**
```json
{"command": "get_new_uid"}
```

**Response Format:**
```json
{
  "status": "success",
  "uid": "uid://dmbxm1qp5555x"
}
```

The plugin uses Godot's built-in `ResourceUID` API to generate unique identifiers:
```gdscript
var new_id = ResourceUID.create_id()
var uid_string = ResourceUID.id_to_text(new_id)
```

### MCP Server (TCP Client)

The MCP server provides a `generate_godot_uid` tool that:
1. Connects to `localhost:8085` via TCP
2. Sends the `get_new_uid` command
3. Receives and returns the generated UID string
4. Handles errors gracefully (connection refused, timeouts, malformed data)

## 🧪 Development

### Prerequisites

- Node.js 20+
- npm
- Godot 4.x (for testing the plugin)

### Setup

```bash
# Install dependencies
npm install

# Build the MCP server
npm run build

# Run tests
npm run test
```

### Testing Without Godot

The test suite includes a mock TCP server that simulates the Godot plugin:

```bash
cd mcp_server
npm test
```

Test scenarios include:
- ✅ Successful UID generation
- ❌ Connection refused (Godot not running)
- ❌ Malformed JSON responses
- ❌ Timeout handling

## 📤 Publishing

The repository includes a GitHub Actions workflow for publishing to NPM:

### Manual Publishing

Go to **Actions > Publish to NPM > Run workflow**

**Options:**
- **Version**: Leave empty to publish current `package.json` version, or specify:
  - Semver: `1.0.1`, `2.0.0`
  - Bump type: `major`, `minor`, `patch`

### Workflow Steps

1. **Build & Test**: Compiles TypeScript and runs integration tests
2. **Version Bump** (optional): Runs `npm version` and creates a git tag
3. **Publish**: Uploads to NPM with public access
4. **GitHub Release** (optional): Creates a release with the version tag

### Required Secrets

Add these secrets to your GitHub repository:
- `NPM_TOKEN`: NPM authentication token with publish permissions

## 🛠️ Configuration

### Godot Plugin

To change the TCP port, edit `mcp_bridge.gd`:

```gdscript
var server_port: int = 8085  # Change this value
```

### MCP Server

The MCP server connects to `localhost:8085` by default. To customize:

```typescript
const client = new GodotClient('localhost', 8085, 2000);
```

## 📝 Usage Example

### With Claude Desktop

Add to your Claude Desktop config:

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

Then in Claude:
```
"Generate a new Godot ResourceUID"
```

Claude will use the `generate_godot_uid` tool and return a valid `uid://` string.

## 🤝 Contributing

Contributions are welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

MIT

## 🐛 Troubleshooting

### "Cannot connect to Godot Editor"

- Ensure Godot Editor is running
- Verify the MCP Bridge plugin is enabled
- Check that port 8085 is not blocked by a firewall

### "Connection timeout"

- The Godot Editor may be frozen or busy
- Try restarting the Godot Editor
- Increase the timeout in `GodotClient` constructor

### Tests failing

```bash
# Make sure no other service is using port 8085
lsof -i :8085

# Run tests with verbose output
npm test -- --verbose
```

## 📚 Resources

- [Model Context Protocol Documentation](https://modelcontextprotocol.io/)
- [Godot ResourceUID Documentation](https://docs.godotengine.org/en/stable/classes/class_resourceuid.html)
- [Godot Editor Plugins Guide](https://docs.godotengine.org/en/stable/tutorials/plugins/editor/index.html)