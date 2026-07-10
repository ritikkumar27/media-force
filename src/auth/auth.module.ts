import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { UsersModule } from 'src/users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';


@Module({

  imports: [
    UsersModule,
    JwtModule.registerAsync({
      
      global: true,
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: (configService: ConfigService) => ({

        secret: configService.get<string>('JWT_SECRET'), // remove : change secret in .env for producttion
        signOptions: {expiresIn: '1d'},

      })

    })
  ],

  controllers: [AuthController],
  providers: [AuthService]
})
export class AuthModule {}


      
      
      
      // global: true,
      // secret: process.env.JWT_SECRET, // remove : change in production
      // signOptions: {expiresIn: '1d'},