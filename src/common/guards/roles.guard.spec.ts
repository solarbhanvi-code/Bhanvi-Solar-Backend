import { ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { UserRole } from '../types/enums';

function makeContext(user: unknown): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

describe('RolesGuard', () => {
  it('allows the request through when the route declares no required roles', () => {
    const reflector = {
      getAllAndOverride: jest.fn(() => undefined),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    expect(guard.canActivate(makeContext(undefined))).toBe(true);
  });

  it('denies access when no authenticated user is present', () => {
    const reflector = {
      getAllAndOverride: jest.fn(() => [UserRole.ADMIN]),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    expect(guard.canActivate(makeContext(undefined))).toBe(false);
  });

  it("denies access when the user's role is not in the required list", () => {
    const reflector = {
      getAllAndOverride: jest.fn(() => [UserRole.ADMIN]),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    expect(guard.canActivate(makeContext({ role: 'editor' }))).toBe(false);
  });

  it('allows access when the user has a required role', () => {
    const reflector = {
      getAllAndOverride: jest.fn(() => [UserRole.ADMIN]),
    } as unknown as Reflector;
    const guard = new RolesGuard(reflector);
    expect(guard.canActivate(makeContext({ role: UserRole.ADMIN }))).toBe(true);
  });
});
