export interface ConfInvite {
  href: string;
  user: {
    username: string;
    prename: string;
    surname: string;
  };
  users: {
    username: string;
    prename: string;
    surname: string;
  }[];
}
