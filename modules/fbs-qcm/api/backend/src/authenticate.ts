import { Jwt, JwtPayload } from "jsonwebtoken";
import { Access } from "./utils/enum";
import { getTutorCourseRoles } from "./utils/utils";


export function authenticate(tokenData: JwtPayload, level: number, course: number) {
    let actualLevel: number = findLevel(tokenData, course);
    if(actualLevel >= level) {
        return true;
    }
    return false;
}

function findLevel(tokenData: JwtPayload, course: number) {
    if(tokenData.globalRole == "ADMIN") {
        return Access.admin;
    }
    if(tokenData.globalRole == "MODERATOR") {
        return Access.moderator;
    }
    let tutorList = getTutorCourseRoles(tokenData);
    if(tutorList.includes(course)) {
        return Access.tutorInCourse;
    }
    return Access.student;
}