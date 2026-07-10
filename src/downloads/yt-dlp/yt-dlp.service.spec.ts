import { Test, TestingModule } from '@nestjs/testing';
import { YtDlpService } from './yt-dlp.service';

describe('YtDlpService', () => {
  let service: YtDlpService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [YtDlpService],
    }).compile();

    service = module.get<YtDlpService>(YtDlpService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
