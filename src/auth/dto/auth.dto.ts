import { IsEmail, IsNotEmpty, MinLength } from "class-validator";


export class AuthDto {
    @IsEmail({}, {message: 'Please provide a valid email'})
    email: string;

    @IsNotEmpty()
    @MinLength(6, {message: 'Password must be atleast 6 characters long'})
    password: string;
}