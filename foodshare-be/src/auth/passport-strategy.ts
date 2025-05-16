// This is a utility function to fix TypeScript issues with Passport strategies
export function PassportStrategy(Strategy: any, name?: string): any {
  abstract class MixinStrategy extends Strategy {
    constructor(...args: any[]) {
      super(...args);
    }
  }
  
  return MixinStrategy;
} 