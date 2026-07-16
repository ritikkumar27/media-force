import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, MinLength } from "class-validator";


export class AuthDto {

    @ApiProperty({example: 'user@mediaforce.com', description: 'The email address of the user'})
    @IsEmail({}, {message: 'Please provide a valid email'})
    email: string;


    @ApiProperty({ example: 'strongPassword123!', minimum: 6, description: 'The password of the user' })
    @IsNotEmpty()
    @MinLength(6, {message: 'Password must be atleast 6 characters long'})
    password: string;
}