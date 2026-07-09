import { Body, Controller, Get, Post } from '@nestjs/common';
import { DownloadsService } from './downloads.service';
import { CreateDownloadDto } from './dto/create-download.dto';

@Controller('downloads')
export class DownloadsController {

    constructor(private readonly downloadsService: DownloadsService){}


    // handles POST localhost:3000/downloads
    @Post()
    addDownload(@Body() createDownloadDto: CreateDownloadDto){
        return this.downloadsService.addDownload(createDownloadDto.url);
    }

    // handles GET localhost:3000/downloads
    @Get()
    getDownloads(){
        return this.downloadsService.getDownloads();
    }

}
