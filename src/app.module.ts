import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DownloadsModule } from './downloads/downloads.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [

    ConfigModule.forRoot({
      isGlobal: true,
    }),

    TypeOrmModule.forRootAsync({

      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
      type: 'postgres',
      
      // also i could have used process.env here but for testing and edge cases i decided not to
      
      host: configService.get<string>('DB_HOST'), 
      port: configService.get<number>('DB_PORT'),
      username: configService.get<string>('POSTGRES_USER'),
      password: configService.get<string>('POSTGRES_PASSWORD'),
      database: configService.get<string>('POSTGRES_DB'),
      autoLoadEntities: true,
      synchronize: true, // remove: drop this in production

      }),
    }),

    DownloadsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
