# Godot Plugin Installation

This plugin provides a TCP bridge for the Model Context Protocol (MCP) server to generate Godot ResourceUID strings.

## Installation

1. Copy this entire folder (`lpenguin-mcp-server`) to your Godot project's `addons/` directory:
   ```
   your_project/
   └── addons/
       └── lpenguin-mcp-server/
           ├── plugin.cfg
           └── mcp_bridge.gd
   ```

2. Open your Godot project

3. Go to **Project > Project Settings > Plugins**

4. Find **MCP Bridge** in the list and enable it

5. The TCP server will automatically start on port **8085**

## Verification

Check the Godot console for this message:
```
[MCP Bridge] TCP Server started on port 8085
```

## Configuration

To change the port, edit `mcp_bridge.gd`:
```gdscript
var server_port: int = 8085  # Change this value
```

## Usage

Once enabled, the plugin will accept TCP connections on port 8085 and respond to JSON commands:

**Request:**
```json
{"command": "get_new_uid"}
```

**Response:**
```json
{
  "status": "success",
  "uid": "uid://dmbxm1qp5555x"
}
```

## Troubleshooting

- **Port already in use**: Change `server_port` in `mcp_bridge.gd`
- **Plugin not appearing**: Restart Godot Editor
- **Connection refused from MCP server**: Ensure the plugin is enabled and Godot is running
