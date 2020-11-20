export const Roles = {
  GlobalRole: {
    ADMIN: 'ADMIN',
    MODERATOR: 'MODERATOR',
    USER: 'USER',
    isAdmin: (globalRole: string): boolean => {
      return globalRole === Roles.GlobalRole.ADMIN;
    },
    isModerator: (globalRole: string): boolean => {
      return globalRole === Roles.GlobalRole.MODERATOR;
    }
  },
  CourseRole: {
    DOCENT: 'DOCENT',
    TUTOR: 'TUTOR',
    STUDENT: 'STUDENT',
    isDocent: (courseRole: string): boolean => {
      return courseRole === Roles.CourseRole.DOCENT;
    },
    isTutor: (courseRole: string): boolean => {
      return courseRole === Roles.CourseRole.TUTOR;
    }
  }
};
