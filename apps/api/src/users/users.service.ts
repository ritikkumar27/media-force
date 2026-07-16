import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';


@Injectable()
export class UsersService {

    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ){}

    async createUser(email: string, plainTextPassword: string) {

        //checking if user exist based on unique email
        const existingUser = await this.userRepository.findOne({
            where: {email}
        });

        if(existingUser) {
            throw new ConflictException('Email is already in use'); // error 409 http req
        }

        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(plainTextPassword, saltRounds);

        const newUser = this.userRepository.create({
            email,
            passwordHash: hashedPassword,
        });

        return await this.userRepository.save(newUser);
    }

    async findByEmail(email: string){
        return await this.userRepository.findOne({
            where: {email: email}
        });
    }

    



}
