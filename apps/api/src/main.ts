import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const config = new DocumentBuilder()
    .setTitle('MediaForce API')
    .setDescription('The API documentation for MediaForce services')
    .setVersion('1.0')
    .addBearerAuth() // Adds JWT token support in the UI
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
    

  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
  }));


  app.enableCors();  // remove in production ; this is a trick not a for produvtion
  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
