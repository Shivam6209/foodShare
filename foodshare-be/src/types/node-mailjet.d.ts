declare module 'node-mailjet' {
  export interface Client {
    post(resource: string, options: any): Request;
  }

  export interface Request {
    request(data: any): Promise<any>;
  }

  export function apiConnect(apiKey: string, secretKey: string): Client;
} 