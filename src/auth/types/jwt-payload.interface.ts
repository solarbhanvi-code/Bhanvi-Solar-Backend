import { UserRole } from '../../common/types/enums';

export interface JwtPayload {
  sub: string;
  email: string;
  name: string;
  role: UserRole;
}
