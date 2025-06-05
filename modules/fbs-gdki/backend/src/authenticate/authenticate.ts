import { token } from "../model/model";
import { JwtPayload } from "jsonwebtoken";

export async function authenticate(userData: JwtPayload) {
    if(userData.globalRole === "Admin") {
        return true;
    }
    const coursesUserIsAdminIn = getAdminCourseRoles(userData);
    if(coursesUserIsAdminIn.length > 0) {
        return true;
    }
    return false;
}

export function getDocentCourseRoles(tokenData: JwtPayload) {
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

export function getAdminCourseRoles(tokenData: JwtPayload) {
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