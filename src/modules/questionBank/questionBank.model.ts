import { Column, Entity, ManyToOne, PrimaryGeneratedColumn, Timestamp } from 'typeorm';

@Entity('questionBank')
export class QuestionBank {
    @PrimaryGeneratedColumn('uuid')
    id?: string;  

    @Column({type: 'uuid'})
    questionId: string;

    @Column({type: 'uuid'})
    courseId: string;

    @Column({type: 'uuid'})
    teacherId: string;

    @Column({type: 'timestamp', default: new Date})
    createdAt: Date;

    @Column({type: 'timestamp', default: new Date})
    updatedAt: Date;

}

