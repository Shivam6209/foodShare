declare module 'passport-local' {
  import { Request } from 'express';

  export interface IStrategyOptions {
    usernameField?: string;
    passwordField?: string;
    session?: boolean;
    passReqToCallback?: boolean;
  }

  export class Strategy {
    constructor(options: IStrategyOptions, verify: (username: string, password: string, done: (error: any, user?: any, options?: any) => void) => void);
    constructor(verify: (username: string, password: string, done: (error: any, user?: any, options?: any) => void) => void);
    name: string;
    authenticate(req: Request, options?: any): void;
  }
} 