import { Test, TestingModule } from '@nestjs/testing';
import { DownloadsGateway } from './downloads.gateway';

describe('DownloadsGateway', () => {
  let gateway: DownloadsGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DownloadsGateway],
    }).compile();

    gateway = module.get<DownloadsGateway>(DownloadsGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
