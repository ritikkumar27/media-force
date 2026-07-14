import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto } from './dto/auth.dto';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';


@ApiTags('Auth')
@Controller('auth')
export class AuthController {

    constructor(private readonly authService: AuthService){}


    @ApiOperation({ summary: 'Register a new user' })
    @ApiResponse({ status: 201, description: 'User successfully registered.' })
    @ApiResponse({ status: 400, description: 'Bad Request (invalid email or password).' })
    @ApiResponse({ status: 409, description: 'Conflict (email already exists).' })
    @Post('register')
    register(@Body() authDto: AuthDto){
        return this.authService.register(authDto);
    }

    @ApiOperation({ summary: 'Login and get a JWT token' })
    @ApiResponse({ status: 201, description: 'Successfully logged in. Returns JWT token.' })
    @ApiResponse({ status: 401, description: 'Unauthorized (wrong email/password).' })
    @Post('login')
    login(@Body() authDto: AuthDto){
        return this.authService.login(authDto);
    }


}
