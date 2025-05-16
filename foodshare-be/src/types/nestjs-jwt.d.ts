declare module '@nestjs/jwt' {
  export class JwtService {
    constructor(options?: any);
    sign(payload: any, options?: any): string;
    verify(token: string, options?: any): any;
    decode(token: string, options?: any): any;
  }

  export class JwtModule {
    static register(options: any): any;
    static registerAsync(options: any): any;
  }
} 