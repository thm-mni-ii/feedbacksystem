/**
 * The decoded jwt token of a successfully authenticated user.
 */
export interface JWTToken {
  id: number;
  username: string;
  globalRole?: number; //0: Admin, 1: Moderator, 2: User, Default is 2
  courseRoles: [];
}
