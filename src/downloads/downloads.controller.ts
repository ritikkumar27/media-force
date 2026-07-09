import { Body, Controller, Get, Post } from '@nestjs/common';
import { DownloadsService } from './downloads.service';

@Controller('downloads')
export class DownloadsController {

    constructor(private readonly downloadsService: DownloadsService){}


    // handles POST localhost:3000/downloads
    @Post()
    addDownload(@Body('url') url: string){
        if(!url){
            return {error: 'URL is requires'};
        }
        return this.downloadsService.addDownload(url);
    }

    // handles GET localhost:3000/downloads
    @Get()
    getDownloads(){
        return this.downloadsService.getDownloads();
    }




}
