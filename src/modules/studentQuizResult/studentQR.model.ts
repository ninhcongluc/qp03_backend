import { date } from 'joi';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Timestamp } from 'typeorm';

@Entity('studentQuizResult')
export class StudentQuizResult {
    @PrimaryGeneratedColumn('uuid')
    id?: string;

    @Column({type: 'uuid'})
    quizId: string;

    @Column({type: 'uuid'})
    studentId: string;

    @Column({type: 'number'})
    score: number;

    @Column({type: 'timestamp', default: new Date})
    submissionTime: Date;

    @Column({type: 'timestamp', default: new Date})
    createdAt: Date;

    @Column({type: 'timestamp', default: new Date})
    updatedAt: Date;

}




