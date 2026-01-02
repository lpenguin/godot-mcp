import * as net from 'net';

export interface GodotResponse {
  status: string;
  uid?: string;
  message?: string;
}

export class GodotClient {
  private host: string;
  private port: number;
  private timeout: number;

  constructor(host: string = 'localhost', port: number = 8085, timeout: number = 2000) {
    this.host = host;
    this.port = port;
    this.timeout = timeout;
  }

  private async sendCommand(command: string, args: Record<string, unknown>): Promise<GodotResponse> {
    return new Promise((resolve, reject) => {
      const client = new net.Socket();
      let responseData = '';
      const timeoutHandle: NodeJS.Timeout = setTimeout(() => {
        client.destroy();
        reject(new Error('Connection timeout. Make sure Godot Editor is running with the MCP Bridge plugin enabled.'));
      }, this.timeout);

      client.on('data', (data) => {
        responseData += data.toString();

        // Check if we received a complete JSON response (ends with newline)
        if (responseData.includes('\n')) {
          clearTimeout(timeoutHandle);
          client.destroy();

          try {
            const response: GodotResponse = JSON.parse(responseData.trim());

            if (response.status === 'success') {
              resolve(response);
            } else if (response.status === 'error') {
              reject(new Error(`Godot error: ${response.message || 'Unknown error'}`));
            } else {
              reject(new Error('Invalid response format from Godot'));
            }
          } catch (error) {
            reject(new Error(`Failed to parse response from Godot: ${responseData}`));
          }
        }
      });

      client.on('error', (err: NodeJS.ErrnoException) => {
        clearTimeout(timeoutHandle);
        if (err.code === 'ECONNREFUSED') {
          reject(new Error('Cannot connect to Godot Editor. Please open Godot Editor with the MCP Bridge plugin enabled.'));
        } else {
          reject(new Error(`Connection error: ${err.message}`));
        }
      });

      client.on('close', () => {
        clearTimeout(timeoutHandle);
      });

      // Connect and send request
      client.connect(this.port, this.host, () => {
        const request = { command, args };
        client.write(JSON.stringify(request) + '\n');
      });
    });
  }

  async getPathUID(path: string): Promise<string> {
    const response = await this.sendCommand('get_path_uid', { path });
    if (!response.uid) {
      throw new Error('Invalid response: missing UID');
    }
    return response.uid;
  }

  async rescanFilesystem(): Promise<string> {
    const response = await this.sendCommand('rescan_filesystem', {});
    return response.message || 'Filesystem rescan initiated';
  }

  async moveResource(fromPath: string, toPath: string): Promise<string> {
    const response = await this.sendCommand('move_resource', { from_path: fromPath, to_path: toPath });
    return response.message || `Successfully moved ${fromPath} to ${toPath}`;
  }
}
