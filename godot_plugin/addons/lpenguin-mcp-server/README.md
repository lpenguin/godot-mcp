# Godot Plugin Installation

This plugin provides a TCP bridge for the Model Context Protocol (MCP) server to generate and manage Godot ResourceUID strings. It intelligently caches UIDs for resource paths and reuses existing ones when available.

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
{
  "command": "get_path_uid",
  "args": {
    "path": "res://scenes/player.tscn"
  }
}
```

**Response:**
```json
{
  "status": "success",
  "uid": "uid://dmbxm1qp5555x"
}
```

### How UIDs are Managed

1. **First request for a path**: A new UID is generated and registered with Godot's ResourceUID system
2. **Subsequent requests**: The cached UID is returned
3. **Existing resources**: If the path already has a UID in Godot's system, it's reused

This ensures consistent UIDs across your project and prevents duplicate UID generation.

## Troubleshooting

- **Port already in use**: Change `server_port` in `mcp_bridge.gd`
- **Plugin not appearing**: Restart Godot Editor
- **Connection refused from MCP server**: Ensure the plugin is enabled and Godot is running
