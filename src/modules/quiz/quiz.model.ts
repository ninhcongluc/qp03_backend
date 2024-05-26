import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity ('quiz')
export class Quiz {
    @PrimaryGeneratedColumn ('uuid')
    id?: string;

    @Column({type: 'uuid'})
    courseId: string;

    @Column()
    name: string;

    @Column({nullable: true})
    description: string | null;

    @Column({type: 'timestamp', default: new Date})
    startDate: Date;

    @Column({type: 'timestamp', default: new Date})
    endDate: Date;

    @Column({type: 'number'})
    timeLimitMinutes: number;

    @Column({type: 'number'})
    maxparticipants: number;

    @Column({nullable: true})
    isHidden?: boolean;

    @Column({type: 'timestamp', default: new Date})
    createdAt: Date;

    @Column({type: 'timestamp', default: new Date})
    updatedAt: Date;
}