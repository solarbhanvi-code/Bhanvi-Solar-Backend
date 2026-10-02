import { Test, TestingModule } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import * as argon2 from 'argon2';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: { findByEmail: jest.Mock };

  beforeEach(async () => {
    usersService = { findByEmail: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: usersService },
        {
          provide: JwtService,
          useValue: { sign: jest.fn(() => 'signed-token'), verify: jest.fn() },
        },
        {
          provide: ConfigService,
          useValue: { get: jest.fn(() => 'config-value') },
        },
      ],
    }).compile();

    service = module.get(AuthService);
  });

  it('rejects an unknown email', async () => {
    usersService.findByEmail.mockResolvedValue(null);
    await expect(
      service.validateUser('nobody@example.com', 'password123'),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('rejects an inactive user even with the correct password', async () => {
    const hash = await argon2.hash('password123');
    usersService.findByEmail.mockResolvedValue({
      id: '1',
      isActive: false,
      password: hash,
    });
    await expect(
      service.validateUser('admin@example.com', 'password123'),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('rejects an incorrect password', async () => {
    const hash = await argon2.hash('correct-password');
    usersService.findByEmail.mockResolvedValue({
      id: '1',
      isActive: true,
      password: hash,
    });
    await expect(
      service.validateUser('admin@example.com', 'wrong-password'),
    ).rejects.toThrow(UnauthorizedException);
  });

  it('accepts a correct email/password combination and returns the user', async () => {
    const hash = await argon2.hash('correct-password');
    const user = {
      id: '1',
      isActive: true,
      password: hash,
      email: 'admin@example.com',
    };
    usersService.findByEmail.mockResolvedValue(user);

    const result = await service.validateUser(
      'admin@example.com',
      'correct-password',
    );
    expect(result).toBe(user);
  });
});
