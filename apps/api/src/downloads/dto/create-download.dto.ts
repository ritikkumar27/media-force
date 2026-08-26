import { IsEnum, IsNotEmpty, IsOptional, IsUrl } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class CreateDownloadDto {


    @ApiProperty({ example: 'https://youtube.com/watch?v=12345', description: 'The URL of the video to download' })
    @IsNotEmpty()
    @IsUrl()
    url: string;

    @ApiProperty({example: '720p', description: 'The requested quality of the video', required: true})
    @IsNotEmpty()
    @IsEnum(['360p', '480p', '720p', '1080p'])
    quality: string;
}