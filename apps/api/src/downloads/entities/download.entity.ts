import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity('downloads') // table : downloads
export class Download {
    @PrimaryGeneratedColumn('uuid') // auto unique id generator
    id: string;

    @Column() // store url sent by user
    url: string;

    @Column({default: '720p'})
    quality: string;

    @Column({default: 'pending'}) //default pending
    status: string;

    @Column()
    userId: string


    @Column({nullable: true})
    title: string;

    @Column({nullable: true})
    thumbnail: string;

    @CreateDateColumn() // autosave the time row is inserted
    createdAt: Date;

}