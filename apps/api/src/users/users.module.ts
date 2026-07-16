import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])], // user table connection
  providers: [UsersService],
  exports: [UsersService], // i am exporting this to use in Auth module
})
export class UsersModule {}
