import { GodotClient } from '../src/godot-client';
import { MockGodotServer } from './mock-server';

describe('GodotClient Integration Tests', () => {
  let mockServer: MockGodotServer;
  let client: GodotClient;

  beforeEach(() => {
    mockServer = new MockGodotServer(8085);
    client = new GodotClient('localhost', 8085, 2000);
  });

  afterEach(async () => {
    await mockServer.stop();
  });

  describe('Success Scenarios', () => {
    test('should successfully get a UID from mock server', async () => {
      await mockServer.start();
      
      mockServer.setResponseHandler((data) => {
        const request = JSON.parse(data.trim());
        expect(request.command).toBe('get_new_uid');
        return JSON.stringify({
          status: 'success',
          uid: 'uid://test1234567890'
        }) + '\n';
      });

      const uid = await client.getNewUID();
      expect(uid).toBe('uid://test1234567890');
    });

    test('should handle different UID formats', async () => {
      await mockServer.start();
      
      const testUID = 'uid://abcdefghijklmnop';
      mockServer.setResponseHandler(() => {
        return JSON.stringify({
          status: 'success',
          uid: testUID
        }) + '\n';
      });

      const uid = await client.getNewUID();
      expect(uid).toBe(testUID);
    });
  });

  describe('Connection Refused Scenarios', () => {
    test('should return user-friendly error when server is not running', async () => {
      // Don't start the mock server
      await expect(client.getNewUID()).rejects.toThrow(
        'Cannot connect to Godot Editor. Please open Godot Editor with the MCP Bridge plugin enabled.'
      );
    });
  });

  describe('Malformed Data Scenarios', () => {
    test('should handle invalid JSON response', async () => {
      await mockServer.start();
      
      mockServer.setResponseHandler(() => {
        return 'This is not JSON\n';
      });

      await expect(client.getNewUID()).rejects.toThrow(
        /Failed to parse response from Godot/
      );
    });

    test('should handle response without newline', async () => {
      await mockServer.start();
      
      mockServer.setResponseHandler(() => {
        // Return valid JSON but without newline - should timeout
        return JSON.stringify({
          status: 'success',
          uid: 'uid://test'
        });
      });

      await expect(client.getNewUID()).rejects.toThrow(/timeout/i);
    }, 3000);

    test('should handle error response from server', async () => {
      await mockServer.start();
      
      mockServer.setResponseHandler(() => {
        return JSON.stringify({
          status: 'error',
          message: 'Something went wrong'
        }) + '\n';
      });

      await expect(client.getNewUID()).rejects.toThrow(
        'Godot error: Something went wrong'
      );
    });

    test('should handle response with missing uid field', async () => {
      await mockServer.start();
      
      mockServer.setResponseHandler(() => {
        return JSON.stringify({
          status: 'success'
          // Missing uid field
        }) + '\n';
      });

      await expect(client.getNewUID()).rejects.toThrow(
        'Invalid response format from Godot'
      );
    });

    test('should handle response with invalid status', async () => {
      await mockServer.start();
      
      mockServer.setResponseHandler(() => {
        return JSON.stringify({
          status: 'unknown',
          uid: 'uid://test'
        }) + '\n';
      });

      await expect(client.getNewUID()).rejects.toThrow(
        'Invalid response format from Godot'
      );
    });
  });

  describe('Timeout Scenarios', () => {
    test('should timeout if server does not respond', async () => {
      await mockServer.start();
      
      mockServer.setResponseHandler(() => {
        // Don't send any response
        return '';
      });

      await expect(client.getNewUID()).rejects.toThrow(/timeout/i);
    }, 3000);
  });
});
