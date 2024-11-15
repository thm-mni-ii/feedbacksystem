import { JsonWebTokenError, Jwt, JwtPayload } from "jsonwebtoken";
import { Access, CourseAccess } from "./utils/enum";
import { getDocentCourseRoles, getTutorCourseRoles } from "./utils/utils";


export function authenticate(tokenData: JwtPayload, level: number, course: number) {
    let actualLevel: number = findLevel(tokenData, course);
    if(actualLevel >= level) {
        return true;
    }
    return false;
}

export function authenticateInCourse(tokenData: JwtPayload, level: number, course: number) {
    if(tokenData.globalRole == "ADMIN") {
        return CourseAccess.admin;
    }
    let docentList = getDocentCourseRoles(tokenData);
    if(docentList.includes(course)) {
        return CourseAccess.docentInCourse;
    }
    let tutorList = getTutorCourseRoles(tokenData);
    if(tutorList.includes(course)) {
        return CourseAccess.tutorInCourse;
    }
    //SOllte nicht so sein funktioniert aber geerade schnell
    return CourseAccess.studentInCourse;
}

function findLevel(tokenData: JwtPayload, course: number) {
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
    return Access.student;
}
