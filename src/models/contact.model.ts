/* eslint-disable indent */
import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
    Entity,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";

@Entity()
class Contact {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({ nullable: true })
    phoneNumber?: string;

    @Column({ nullable: true })
    email?: string;

    @Column({ nullable: true })
    linkedId?: number;

    @Column({
        type: "enum",
        enum: ["primary", "secondary"],
        default: "primary"
    })
    linkPrecedence!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    @DeleteDateColumn()
    deletedAt!: Date;
}

export default Contact;
