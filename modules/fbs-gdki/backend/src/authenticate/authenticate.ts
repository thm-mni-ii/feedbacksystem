import { token } from "../model/model";

export async function authenticate(userData: token) {
    if(userData.globalRole === "Admin") {
        return true;
    }
    const coursesUserIsAdminIn = getAdminCourseRoles(userData);
    if(coursesUserIsAdminIn.length > 0) {
        return true;
    }
    return false;
}

export function getDocentCourseRoles(tokenData: token) {
  let coursesAdmin: number[] = [];
  const courseRolesObject = JSON.parse(tokenData.courseRoles);
  for (const courseId in courseRolesObject) {
    if (courseRolesObject.hasOwnProperty(courseId)) {
      const role = courseRolesObject[courseId];
      if (role == "DOCENT") {
        coursesAdmin.push(parseInt(courseId));
      }
    }
  }
  return coursesAdmin;
}

export function getAdminCourseRoles(tokenData: token) {
  let coursesAdmin: number[] = [];
  const courseRolesObject = JSON.parse(tokenData.courseRoles);
  for (const courseId in courseRolesObject) {
    if (courseRolesObject.hasOwnProperty(courseId)) {
      const role = courseRolesObject[courseId];
      if (role == "TUTOR" || role == "DOCENT") {
        coursesAdmin.push(parseInt(courseId));
      }
    }
  }
  return coursesAdmin;
}

export function getTutorCourseRoles(tokenData: token) {
  let coursesAdmin: number[] = [];
  const courseRolesObject = JSON.parse(tokenData.courseRoles);
  for (const courseId in courseRolesObject) {
    if (courseRolesObject.hasOwnProperty(courseId)) {
      const role = courseRolesObject[courseId];
      if (role == "TUTOR") {
        coursesAdmin.push(parseInt(courseId));
      }
    }
  }
  return coursesAdmin;
}