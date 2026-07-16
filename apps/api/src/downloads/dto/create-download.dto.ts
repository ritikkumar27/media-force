import { IsNotEmpty, IsUrl } from "class-validator";
import { ApiProperty } from '@nestjs/swagger';

export class CreateDownloadDto {


    @ApiProperty({ example: 'https://youtube.com/watch?v=12345', description: 'The URL of the video to download' })
    @IsNotEmpty()
    @IsUrl()
    url: string;
}