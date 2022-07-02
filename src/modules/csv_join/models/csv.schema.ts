import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class CSVEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column({ unique: true })
  userName: string;

  @Column()
  password: string;
}
