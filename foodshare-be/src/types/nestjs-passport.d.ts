declare module '@nestjs/passport' {
  import { Type } from '@nestjs/common';

  export function AuthGuard(type?: string): Type<any>;
  export function PassportStrategy(strategy: any, name?: string): any;
  
  export class PassportModule {
    static register(options?: any): any;
  }
} 