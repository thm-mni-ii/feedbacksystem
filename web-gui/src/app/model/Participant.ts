import {User} from "./User";

export interface Participant {
  user?: User;
  role?: string; // Either DOCENT, TUTOR, or STUDENT
}
