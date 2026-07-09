import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Download } from './entities/download.entity';
import { Repository } from 'typeorm';

export interface DownloadItem {
    id: string;
    url: string;
    status: 'pending' | 'downloading' | 'completed' | 'failed' ;
}


@Injectable()
export class DownloadsService {

    constructor(
        @InjectRepository(Download)
        private readonly downloadRepository: Repository<Download>,
    ){}
    
    async addDownload(url: string){
        const newDownload = this.downloadRepository.create({url});

        return await this.downloadRepository.save(newDownload);
    }

    async getDownloads(){
        return await this.downloadRepository.find({
            order: {createdAt: 'DESC'}
        });
    }
}