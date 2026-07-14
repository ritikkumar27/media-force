import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { DownloadsService } from './downloads.service';
import { CreateDownloadDto } from './dto/create-download.dto';
import { AuthGuard } from 'src/auth/auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Downloads')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('downloads')
export class DownloadsController {

    constructor(private readonly downloadsService: DownloadsService){}

    @ApiOperation({ summary: 'Add a new video download' })
    @ApiResponse({ status: 201, description: 'Download successfully added to queue.' })
    @ApiResponse({ status: 401, description: 'Unauthorized (missing or invalid token).' })
    @Post()
    addDownload(@Body() createDownloadDto: CreateDownloadDto, @Request() req){

        const userId = req.user.sub; //req.user stricker injected by authguard
        return this.downloadsService.addDownload(createDownloadDto.url, userId);
    }

    @ApiOperation({ summary: 'Get all downloads for the current user' })
    @ApiResponse({ status: 200, description: 'Returns a list of downloads.' }) 
    @ApiResponse({ status: 401, description: 'Unauthorized (missing or invalid token).' })
    @Get()
    getDownloads(@Request() req){

        const userId = req.user.sub;
        return this.downloadsService.getDownloads(userId);
    }

}
