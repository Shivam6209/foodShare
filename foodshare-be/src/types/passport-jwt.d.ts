declare module 'passport-jwt' {
  import { Request } from 'express';

  export interface StrategyOptions {
    secretOrKey?: string;
    jwtFromRequest: (req: Request) => string;
    issuer?: string;
    audience?: string;
    algorithms?: string[];
    ignoreExpiration?: boolean;
    passReqToCallback?: boolean;
  }

  export interface VerifiedCallback {
    (error: any, user?: any, info?: any): void;
  }

  export interface JwtVerifyCallback {
    (payload: any, done: VerifiedCallback): void;
  }

  export class Strategy {
    constructor(options: StrategyOptions, verify: JwtVerifyCallback);
    name: string;
    authenticate(req: Request, options?: any): void;
  }

  export namespace ExtractJwt {
    export function fromAuthHeaderAsBearerToken(): (request: Request) => string;
  }
} 