import {User} from "./User";

export interface Participant {
  user?: User;
  role?: number; // Users course role id 0: Docent, 1: Tutor, 2: User
}
