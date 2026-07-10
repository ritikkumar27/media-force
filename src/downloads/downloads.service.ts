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
    
    async addDownload(url: string, userId: string){
        const newDownload = this.downloadRepository.create({
            url,
            userId
        });

        return await this.downloadRepository.save(newDownload);
    }

    async getDownloads(userId: string){
        return await this.downloadRepository.find({
            where: {userId},
            order: {createdAt: 'DESC'}
        });
    }
}