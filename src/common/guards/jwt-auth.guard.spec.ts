import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';

function makeContext(): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => ({}), getResponse: () => ({}) }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

describe('JwtAuthGuard', () => {
  it('bypasses passport authentication entirely for @Public() routes', () => {
    const reflector = {
      getAllAndOverride: jest.fn(() => true),
    } as unknown as Reflector;
    const guard = new JwtAuthGuard(reflector);

    const parentPrototype = Object.getPrototypeOf(JwtAuthGuard.prototype) as {
      canActivate: () => boolean;
    };
    const superSpy = jest.spyOn(parentPrototype, 'canActivate');

    expect(guard.canActivate(makeContext())).toBe(true);
    expect(superSpy).not.toHaveBeenCalled();
    superSpy.mockRestore();
  });

  it('delegates to passport JWT authentication for non-public routes', () => {
    const reflector = {
      getAllAndOverride: jest.fn(() => false),
    } as unknown as Reflector;
    const guard = new JwtAuthGuard(reflector);

    const parentPrototype = Object.getPrototypeOf(JwtAuthGuard.prototype) as {
      canActivate: () => boolean;
    };
    const superSpy = jest
      .spyOn(parentPrototype, 'canActivate')
      .mockReturnValue(false);

    expect(guard.canActivate(makeContext())).toBe(false);
    expect(superSpy).toHaveBeenCalled();
    superSpy.mockRestore();
  });
});
