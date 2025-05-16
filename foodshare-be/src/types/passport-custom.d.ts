declare module 'passport-custom' {
  import { Request } from 'express';

  export class Strategy {
    constructor(verify: (req: Request, done: (error: any, user?: any, options?: any) => void) => void);
    name: string;
  }
} 