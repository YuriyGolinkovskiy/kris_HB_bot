import { Injectable, Scope } from '@nestjs/common';

export const SCREEN = 'SCREEN';

export function Screen(): ClassDecorator {
  return (target: object) => {
    Reflect.defineMetadata(SCREEN, true, target);
    Injectable({ scope: Scope.DEFAULT })(target as any);
  };
}