import type { User } from '../../generated/prisma/client.js';

/** The user as it is ever exposed: the password hash never leaves the service layer. */
export type SafeUser = Omit<User, 'password'>;

declare module '@nestjs/authentication' {
  interface AuthenticationTypes {
    user: SafeUser;
    refreshTokens: false;
  }
}
