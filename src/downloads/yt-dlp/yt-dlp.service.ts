import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { spawn } from 'child_process';

@Injectable()
export class YtDlpService {
  async fetchMetadata(url: string): Promise<any> {
    // --dump-json is ytdlp command to fetch all the metadata from yt api
    return new Promise((resolve, reject) => {
      const ytDlpProcess = spawn('yt-dlp', ['--dump-json', url]); //ytdlp spawn async

      let outputData = '';

      ytDlpProcess.stdout.on('data', (chunk) => {
        outputData += chunk.toString();
      });

      ytDlpProcess.on('close', (code) => {
        if (code === 0) {
          try {
            // console.log('Raw output:', outputData); // remove : in production this is for dev log only
            const metadata = JSON.parse(outputData);
            resolve(metadata);
          } catch (error) {
            reject(
              new InternalServerErrorException('Failed to parse yt-dlp output'),
            );
          }
        } else {
          reject(
            new InternalServerErrorException(`yt-dlp exited with code ${code}`),
          );
        }
      });

      ytDlpProcess.on('error', (err) => {
        reject(
          new InternalServerErrorException('Failed to start yt-dlp process'),
        );
      });
    });
  }
}
