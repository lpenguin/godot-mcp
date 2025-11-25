# Quick Setup Guide

This guide will help you get the Godot MCP Server & Plugin up and running quickly.

## Step 1: Set Up the Godot Plugin

1. Open your Godot 4 project
2. Copy the `godot_plugin/addons/lpenguin-mcp-server/` folder to your project:
   ```
   your_godot_project/
   └── addons/
       └── lpenguin-mcp-server/
   ```
3. In Godot, go to **Project > Project Settings > Plugins**
4. Enable **MCP Bridge**
5. Verify in the console: `[MCP Bridge] TCP Server started on port 8085`

## Step 2: Test the MCP Server Locally

```bash
# From the repository root
cd mcp_server

# Install dependencies
npm install

# Build the project
npm run build

# Run tests to verify everything works
npm test
```

## Step 3: Test the Integration

### Terminal 1: Keep Godot Editor Running
Make sure Godot is open with the plugin enabled.

### Terminal 2: Test the MCP Server
```bash
cd mcp_server

# Test manually with a simple Node.js script
node -e "
const { GodotClient } = require('./dist/godot-client.js');
const client = new GodotClient();
client.getNewUID().then(uid => console.log('Generated UID:', uid));
"
```

You should see output like:
```
Generated UID: uid://dmbxm1qp5555x
```

## Step 4: Use with Claude Desktop

1. Add to your Claude config (`~/Library/Application Support/Claude/claude_desktop_config.json` on macOS):
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

2. Restart Claude Desktop

3. Test by asking Claude:
   ```
   "Generate a new Godot ResourceUID"
   ```

## Step 5: Publish to NPM (Optional)

### Prerequisites
1. Create an NPM account at https://www.npmjs.com/
2. Generate an access token with publish permissions
3. Add `NPM_TOKEN` secret to your GitHub repository

### Publishing
1. Go to **Actions > Publish to NPM**
2. Click **Run workflow**
3. Enter a version (e.g., `1.0.0`, `patch`, `minor`, `major`) or leave empty
4. Wait for the workflow to complete

### Verify
```bash
npx @lpenguin/godot-mcp
```

## Troubleshooting

### Plugin Not Starting
- Check Godot console for errors
- Verify `plugin.cfg` and `mcp_bridge.gd` are in the correct location
- Try disabling and re-enabling the plugin

### Cannot Connect from MCP Server
```bash
# Check if port 8085 is open
lsof -i :8085

# Should show Godot process
```

### Build Errors
```bash
# Clean and rebuild
cd mcp_server
rm -rf node_modules dist
npm install
npm run build
```

### Test Failures
```bash
# Make sure no other service is using port 8085
# Kill any processes using the port
kill $(lsof -t -i:8085)

# Run tests again
npm test
```

## Next Steps

- Read the main [README.md](README.md) for detailed documentation
- Check out the [MCP Server README](mcp_server/README.md) for usage examples
- See the [Godot Plugin README](godot_plugin/addons/lpenguin-mcp-server/README.md) for plugin details
- Review the [GitHub Actions workflow](.github/workflows/publish.yml) for CI/CD setup

## Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review the Godot console for plugin errors
3. Check the terminal output for MCP server errors
4. Open an issue on GitHub with details about your setup
