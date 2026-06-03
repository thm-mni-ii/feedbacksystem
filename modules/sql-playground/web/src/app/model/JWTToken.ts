/**
 * The decoded jwt token of a successfully authenticated user.
 */
export interface JWTToken {
  id: number;
  username: string;
  globalRole?: string; // ADMIN, MODERATOR, USER
  courseRoles: [];
  exp: number;
}
