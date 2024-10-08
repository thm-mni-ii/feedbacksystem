import { JwtPayload } from "jsonwebtoken";
import { connect } from "../mongo/mongo";
import { checkCourseAccess, getAdminCourseRoles, getAllQuestionsInCourse, getUserCourseRoles } from "../utils/utils";
import * as mongoDB from "mongodb";
import axios from "axios";

//i don't know what's going on
//BRingen eh nichts und können gelöscht werden
export async function getTeacherCourses(token: string, tokenData: JwtPayload) {
    const adminCourses = await getAdminCourseRoles(tokenData);
    const allCourses = await getCourses(token);
    const courses = findMatchingCourses(adminCourses, allCourses);
    return courses;
}

export async function getCourses(token: string) {
    try {
        const token2 = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJjbGllbnRfYXV0aGVudGljYXRpb24iLCJpZCI6OTczLCJ1c2VybmFtZSI6Impod3M0MiIsImdsb2JhbFJvbGUiOiJVU0VSIiwiY291cnNlUm9sZXMiOiJ7XCIxODdcIjpcIlRVVE9SXCJ9IiwiaWF0IjoxNzI4MzE2OTI2LCJleHAiOjE3MjgzMTcyMjZ9.BdpzQb-VzEE7iI5G-ZqOqOp7wN5R1ZT1VmHWLfvWBXg";
        const response = await axios.get("https:feedback.mni.thm.de/api/v1/courses", {
            headers: {
                'Authorization': `Bearer ${token2}`
            }
        });
        return response.data;
    } catch (error) {
        console.log(error);
        return -1;
    }
}

export async function getStudentCourses(token: string, tokenData: JwtPayload) {
    const studentCourses = await getUserCourseRoles(tokenData);
    const allCourses = await getCourses(token);
    const courses = findMatchingCourses(studentCourses, allCourses);
    return courses;
}

function findMatchingCourses(coursesEnrolled: number[], allCourses: any[]) {
    console.log(coursesEnrolled);
    console.log(allCourses);
    let courses = []; 
    for(let i = 0; i < allCourses.length; i++) {
        for(let j = 0; j < coursesEnrolled.length; j++) {
            if(allCourses[i].id === coursesEnrolled[j]) {
                courses.push(allCourses[i]);
            }
        }
    }
    return courses;
}

export async function allQuestionInCourse(tokenData: JwtPayload, courseId: string) {
    const permission = await checkCourseAccess(tokenData, courseId);
    if(!permission) {
        return -1;
    }
    console.log(4);
    const data = await getAllQuestionsInCourse(courseId);
    if(data === null) {
        return -1;
    }
    return data;

}
