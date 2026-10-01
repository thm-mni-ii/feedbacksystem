import { User } from "./User";

export interface Participant {
  user?: User;
  role?:
    | string
    | {
        value: string; // Either DOCENT, TUTOR, or STUDENT
      };
  visible?: boolean;
}

