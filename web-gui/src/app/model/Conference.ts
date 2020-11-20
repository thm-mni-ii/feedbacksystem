import {User} from './User';

export interface Conference {
  service: string;
  visibility: string;
  attendees: string[];
  href?: string;
  meetingId?: string;
  meetingPassword?: string;
  moderatorPassword?: string;
  creator: User;
}
