import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { DownloadsService } from './downloads.service';
import { CreateDownloadDto } from './dto/create-download.dto';
import { AuthGuard } from 'src/auth/auth.guard';


@UseGuards(AuthGuard)
@Controller('downloads')
export class DownloadsController {

    constructor(private readonly downloadsService: DownloadsService){}


    @Post()
    addDownload(@Body() createDownloadDto: CreateDownloadDto, @Request() req){

        const userId = req.user.sub; //req.user stricker injected by authguard
        return this.downloadsService.addDownload(createDownloadDto.url, userId);
    }

    @Get()
    getDownloads(@Request() req){

        const userId = req.user.sub;
        return this.downloadsService.getDownloads(userId);
    }

}
