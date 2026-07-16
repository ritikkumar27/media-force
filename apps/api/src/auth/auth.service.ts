import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from 'src/users/users.service';
import { AuthDto } from './dto/auth.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService
    ){}

    async register(authDto: AuthDto){
        const user = await this.usersService.createUser(authDto.email, authDto.password);

        const payload = {sub: user.id, email: user.email};

        return {
            access_token: await this.jwtService.signAsync(payload),
        };
    }

    async login(authDto: AuthDto) {
        const user = await this.usersService.findByEmail(authDto.email);
        if(!user){
            throw new UnauthorizedException('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(authDto.password, user.passwordHash);
        if(!isPasswordValid){
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = {sub: user.id, email: user.email};

        return {
            access_token: await this.jwtService.signAsync(payload),
        };
        
    }
}
