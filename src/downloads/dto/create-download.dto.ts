import { IsNotEmpty, IsUrl } from "class-validator";

export class CreateDownloadDto {
    @IsNotEmpty()
    @IsUrl()
    url: string;
}