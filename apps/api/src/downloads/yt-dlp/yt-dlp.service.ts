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

  async executeDownload(
    url: string,
    downloadId: string,
    onProgress: (progress: number) => void,
  ): Promise<string> {
    return new Promise((resolve, reject) => {
      const outputPath = `./storage/${downloadId}.%(ext)s`; //%(ext)s is a special variable recognised by ytdlp engine

      const ytDlpProcess = spawn('yt-dlp', [
        '--newline', //prints a clean line every time the progress
        '-o',
        outputPath,
        url,
      ]);

      ytDlpProcess.stdout.on('data', (chunk) => {
        const line = chunk.toString();

        const progressMatch = line.match(/\[download\]\s+(\d+\.\d+)%/);

        if (progressMatch && progressMatch[1]) {
          const percentage = parseFloat(progressMatch[1]);
          onProgress(percentage);
        }
      });

      let errorOutput = '';
      ytDlpProcess.stderr.on('data', (chunk) => {
        errorOutput += chunk.toString();
      });

      //handling completion of the download event

      ytDlpProcess.on('close', (code) => {
        if (code === 0) {
          resolve('Download completed successfully');
        } else {
          reject(
            new InternalServerErrorException(
              `Download failed with code ${code}. Error: ${errorOutput}`
            ),
          );
        }
      });

      // handle hard errors
      ytDlpProcess.on('error', (err) => {
        reject(new InternalServerErrorException('Process failed to start'));
      });
    });
  }
}
