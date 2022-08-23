export interface User {
  id?: number;
  prename: string;
  surname: string;
  email: string;
  password?: string;
  username: string;
  alias?: string;
  globalRole?: string; // ADMIN, MODERATOR, or USER
}
