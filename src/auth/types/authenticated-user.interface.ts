import { UserRole } from '../../common/types/enums';

export interface AuthenticatedUser {
  userId: string;
  email: string;
  name: string;
  role: UserRole;
}
