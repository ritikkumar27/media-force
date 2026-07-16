import { INestApplication, ValidationPipe } from "@nestjs/common"
import { Test, TestingModule } from "@nestjs/testing";
import { AppModule } from "src/app.module";
import request from 'supertest';



describe('AuthController (e2e)', () => {
    let app: INestApplication;

    const testEmail = `user_${Date.now()}@mediaforce.com`;
    const testPassword = 'strongPassword123!';

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        }).compile();

        app = moduleFixture.createNestApplication();
        app.useGlobalPipes(new ValidationPipe({whitelist: true}));
        await app.init();
    });

            //Registeration Test
    it('/auth/register (POST) - fails if email is missing', () => {
    return request(app.getHttpServer())
      .post('/auth/register')
      .send({ password: testPassword })
      .expect(400); 
    });

    it('/auth/register (POST) - succeeds and returns a JWT token', () => {
        return request(app.getHttpServer())
            .post('/auth/register')
            .send({email: testEmail, password: testPassword})
            .expect(201)
            .expect((res) => {
                expect(res.body.access_token).toBeDefined();
            });
    });

        //Login Test

    it('/auth/login (POST) - fails with wrong password', () => {
        return request(app.getHttpServer())
            .post('/auth/login')
            .send({email:testEmail, password: 'wrongPassword!'})
            .expect(401); //unauthorised
    });

    it('/auth/login (POST) - succeeds with correct password', () => {
        return request(app.getHttpServer())
            .post('/auth/login')
            .send({email: testEmail, password: testPassword})
            .expect(201)
            .expect((res) => {
                expect(res.body.access_token).toBeDefined();
            });
    });

    afterAll(async () => {
        await app.close();
    })

})


