import { Exclude } from "class-transformer";

import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { userRole } from "utils/constants";

@Entity('users')
export class User {

    

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ type: 'varchar', length: 50, nullable: true })
    username: string;

    @Column({ type: 'varchar', length: 250, unique: true })
    email: string;

    @Column()
    @Exclude()
    password: string;

    @Column({ type: 'enum', enum: userRole, default: userRole.USER })
    role: userRole;




    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

  

}