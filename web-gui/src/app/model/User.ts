// export?
export interface User {
  id?: number;
  prename: string;
  surname: string;
  email: string;
  password?: string;
  username: string;
  alias?: string;
  globalRole?: number; //0: Admin, 1: Moderator, 2: User, Default is 2
}
