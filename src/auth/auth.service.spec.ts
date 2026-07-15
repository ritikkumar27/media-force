import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from 'src/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService (Unit)', () => {
  let authService: AuthService;

  const mockUsersService = {
    findByEmail: jest.fn(), 
  };

  const mockJwtService = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    authService = module.get<AuthService>(AuthService);
  });

  it('login() should throw an UnauthorizedException if the user email is not found', async () => {
    mockUsersService.findByEmail.mockResolvedValue(null);

    await expect(
        authService.login({ email: 'fake@email.com', password: '123' })
    ).rejects.toThrow(UnauthorizedException);
  });
});