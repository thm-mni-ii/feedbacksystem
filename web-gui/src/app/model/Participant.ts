import {User} from './User';

export interface Participant {
  user?: User;
  role?: {
    value: string; // Either DOCENT, TUTOR, or STUDENT
  };
}
