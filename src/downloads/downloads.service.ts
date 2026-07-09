import { Injectable } from '@nestjs/common';

export interface DownloadItem {
    id: string;
    url: string;
    status: 'pending' | 'downloading' | 'completed' | 'failed' ;
}


@Injectable()
export class DownloadsService {
    private downloads: DownloadItem[] = [];

    addDownload(url : string) {
        const id = Date.now().toString(); //fakeID
        const newDownload: DownloadItem = {
            id,
            url,
            status: 'pending',
        };

        this.downloads.push(newDownload);
        return newDownload;
    }

    getDownloads() {
        return this.downloads;
    }

}
