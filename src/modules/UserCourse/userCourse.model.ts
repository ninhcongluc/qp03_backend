import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity ( 'userCourse' )
export class UserCourse {
    @PrimaryGeneratedColumn('uuid')
    id?: string;

    @Column({ type: 'uuid'})
    userID?: string;

    @Column ({type: 'uuid'})
    courseId?: string;
}