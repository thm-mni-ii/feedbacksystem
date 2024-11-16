import { JsonWebTokenError, Jwt, JwtPayload } from "jsonwebtoken";
import { Access, CourseAccess } from "./utils/enum";
import { getDocentCourseRoles, getTutorCourseRoles, getUserCourseRoles } from "./utils/utils";
import { getStudentCourses } from "./course/course";


export function authenticate(tokenData: JwtPayload, level: number) {
    const actualLevel: number = findLevel(tokenData);
    if(actualLevel >= level) {
        return true;
    }
    return false;
}

export function authenticateInCourse(tokenData: JwtPayload, level: number, course: number) {
    const actualLevel: number = findCourseLevel(tokenData, course);
    if(actualLevel >= level) {
        return true;
    }
    return false;
}

function findCourseLevel(tokenData: JwtPayload, course: number) {
    if(tokenData.globalRole == "ADMIN") {
        return CourseAccess.admin;
    }
    const docentList = getDocentCourseRoles(tokenData);
    if(docentList.includes(course)) {
        return CourseAccess.docentInCourse;
    }
    const tutorList = getTutorCourseRoles(tokenData);
    if(tutorList.includes(course)) {
        return CourseAccess.tutorInCourse;
    }
    const studentList = getUserCourseRoles(tokenData);
    if(studentList.includes(course)) {
        return CourseAccess.studentInCourse;
    }
    return -1;
}

function findLevel(tokenData: JwtPayload) {
    if(tokenData.globalRole == "ADMIN") {
        return Access.admin;
    }
    if(tokenData.globalRole == "MODERATOR") {
        return Access.moderator;
    }
    let tutorList = getTutorCourseRoles(tokenData);
    if(tutorList.length > 0) {
        return Access.tutor;
    }
    const studentList = getUserCourseRoles(tokenData);
    if(studentList.length > 0) {
        return CourseAccess.studentInCourse;
    }
    return -1;
}
