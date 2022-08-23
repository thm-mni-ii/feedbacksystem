export const Roles = {
  GlobalRole: {
    ADMIN: "ADMIN",
    MODERATOR: "MODERATOR",
    USER: "USER",
    isAdmin: (globalRole: string): boolean => {
      return globalRole === Roles.GlobalRole.ADMIN;
    },
    isModerator: (globalRole: string): boolean => {
      return globalRole === Roles.GlobalRole.MODERATOR;
    },
    getSortOrder: (role: string): number => {
      switch (role) {
        case "USER":
          return 0;
        case "MODERATOR":
          return -1;
        case "ADMIN":
          return -2;
        default:
          console.error(`unknown role: ${role}`);
          return 1;
      }
    },
  },
  CourseRole: {
    DOCENT: "DOCENT",
    TUTOR: "TUTOR",
    STUDENT: "STUDENT",
    isDocent: (courseRole: string): boolean => {
      return courseRole === Roles.CourseRole.DOCENT;
    },
    isTutor: (courseRole: string): boolean => {
      return courseRole === Roles.CourseRole.TUTOR;
    },
    getSortOrder: (role: string): number => {
      switch (role) {
        case "STUDENT":
          return 0;
        case "TUTOR":
          return -1;
        case "DOCENT":
          return -2;
        default:
          console.error(`unknown role: ${role}`);
          return 1;
      }
    },
  },
};
