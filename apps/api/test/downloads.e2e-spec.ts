import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { YtDlpService } from 'src/downloads/yt-dlp/yt-dlp.service';


describe('DownloadsController (e2e)', () => {
  let app: INestApplication;
  
  const testEmail = `downloader_${Date.now()}@mediaforce.com`;
  const testPassword = 'securePassword123!';
  let jwtToken = ''; 

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
    .overrideProvider(YtDlpService)
    .useValue({
        fetchMetadata: jest.fn().mockResolvedValue({title: 'Test Video', thumbnail: 'test.jpg'}),
        executeDownload: jest.fn().mockResolvedValue(true),
    })
    .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ whitelist: true }));
    await app.init();

    
    const registerResponse = await request(app.getHttpServer())
      .post('/auth/register')
      .send({ email: testEmail, password: testPassword });
    

    jwtToken = registerResponse.body.access_token;
  });


  it('/downloads (GET) - fails if no token is provided', () => {
    return request(app.getHttpServer())
      .get('/downloads')
      .expect(401); 
  });


  it('/downloads (POST) - succeeds in adding a download', () => {
    return request(app.getHttpServer())
      .post('/downloads')
      .set('Authorization', `Bearer ${jwtToken}`) 
      .send({ url: 'https://youtube.com/watch?v=dQw4w9WgXcQ' })
      .expect(201); 
  });

  it('/downloads (GET) - gets the users downloads', () => {
    return request(app.getHttpServer())
      .get('/downloads')
      .set('Authorization', `Bearer ${jwtToken}`)
      .expect(200)
      .expect((res) => {
        expect(Array.isArray(res.body)).toBe(true);
      });
  });

  afterAll(async () => {
    await app.close();
  });
});