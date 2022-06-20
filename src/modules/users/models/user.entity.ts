import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Role } from '../enum/role.enum';

@Entity()
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  userName: string;

  @Column()
  password: string;

  @Column({
    type: 'enum',
    enum: Role,
    array: true,
  })
  roles: Role[];
}
