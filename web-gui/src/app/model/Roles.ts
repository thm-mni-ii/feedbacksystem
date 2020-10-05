export const Roles = {
  GlobalRole: {
    ADMIN: 0,
    MODERATOR: 1,
    USER: 2,
    isAdmin: (globalRole: number): boolean => {
      return globalRole == Roles.GlobalRole.ADMIN
    },
    isModerator: (globalRole: number): boolean => {
      return globalRole == Roles.GlobalRole.MODERATOR
    }
  },
  CourseRole: {
    DOCENT: 0,
    TUTOR: 1,
    STUDENT: 2,
    isDocent: (courseRole: number): boolean => {
      return courseRole == Roles.CourseRole.DOCENT
    },
    isTutor: (courseRole: number): boolean => {
      return courseRole == Roles.CourseRole.TUTOR
    }
  }
}
