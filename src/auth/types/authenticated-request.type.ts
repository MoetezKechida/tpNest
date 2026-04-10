import type { Request } from 'express';
import type { User } from '../../user/entities/user.entity';

export type AuthenticatedUser = Pick<
  User,
  'id' | 'username' | 'email' | 'role'
>;

export type AuthenticatedRequest = Request & {
  user?: AuthenticatedUser;
};