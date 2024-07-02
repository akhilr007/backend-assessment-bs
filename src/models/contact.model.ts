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

    @Column({ type: "varchar", nullable: true })
    phoneNumber?: string | null;

    @Column({ type: "varchar", nullable: true })
    email?: string | null;

    @Column({ type: "int", nullable: true })
    linkedId?: number | null;

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
    deletedAt!: Date | null;
}

export default Contact;
