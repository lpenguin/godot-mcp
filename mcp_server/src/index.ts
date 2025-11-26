import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { GodotClient } from './godot-client.js';

const server = new Server(
  {
    name: '@lpenguin/godot-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

const godotClient = new GodotClient();

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'generate_godot_uid',
        description: 'Generate or retrieve a Godot ResourceUID string for a given resource path by connecting to a running Godot Editor instance via TCP. The plugin caches UIDs for paths and reuses existing ones when available.',
        inputSchema: {
          type: 'object',
          properties: {
            path: {
              type: 'string',
              description: 'The resource path (e.g., "res://scenes/player.tscn" or "res://textures/icon.png")',
            },
          },
          required: ['path'],
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  if (request.params.name === 'generate_godot_uid') {
    try {
      const path = request.params.arguments?.path as string | undefined;
      
      if (!path || typeof path !== 'string') {
        return {
          content: [
            {
              type: 'text',
              text: 'Error: Missing required parameter "path". Please provide a resource path (e.g., "res://scenes/player.tscn")',
            },
          ],
          isError: true,
        };
      }

      const uid = await godotClient.getPathUID(path);
      return {
        content: [
          {
            type: 'text',
            text: uid,
          },
        ],
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${errorMessage}`,
          },
        ],
        isError: true,
      };
    }
  }

  throw new Error(`Unknown tool: ${request.params.name}`);
});

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Godot MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
