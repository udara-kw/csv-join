import { Role } from '../enum/role.enum';

export class UserI {
  id: number;
  name: string;
  userName: string;
  password: string;
  roles: Role[];
}
