import * as net from 'net';

export class MockGodotServer {
  private server: net.Server | null = null;
  private port: number;
  private responseHandler: ((data: string) => string) | null = null;

  constructor(port: number = 8085) {
    this.port = port;
  }

  start(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server = net.createServer((socket) => {
        socket.on('data', (data) => {
          const request = data.toString();
          
          if (this.responseHandler) {
            const response = this.responseHandler(request);
            socket.write(response);
          } else {
            // Default behavior: parse request and return success
            try {
              const parsed = JSON.parse(request.trim());
              if (parsed.command === 'get_new_uid') {
                const response = JSON.stringify({
                  status: 'success',
                  uid: 'uid://test1234567890'
                }) + '\n';
                socket.write(response);
              }
            } catch (_error) {
              socket.write(JSON.stringify({ status: 'error', message: 'Invalid request' }) + '\n');
            }
          }
        });
      });

      this.server.listen(this.port, () => {
        resolve();
      });

      this.server.on('error', (err) => {
        reject(err);
      });
    });
  }

  stop(): Promise<void> {
    return new Promise((resolve) => {
      if (this.server) {
        this.server.close(() => {
          resolve();
        });
      } else {
        resolve();
      }
    });
  }

  setResponseHandler(handler: (data: string) => string): void {
    this.responseHandler = handler;
  }
}
