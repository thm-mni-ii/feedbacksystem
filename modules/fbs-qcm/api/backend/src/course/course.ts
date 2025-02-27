import { JwtPayload } from "jsonwebtoken";
import { connect } from "../mongo/mongo";
import { checkCourseAccess, getAdminCourseRoles, getAllQuestionsInCourse, getStudentCourseRoles, getUserCourseRoles} from "../utils/utils";
import * as mongoDB from "mongodb";
import axios from "axios";
import https from "https";
import { authenticateInCourse } from "../authenticate";
import { CourseAccess } from "../utils/enum";


//i don't know what's going on
//BRingen eh nichts und können gelöscht werden
export async function getTeacherCourses(token: string, tokenData: JwtPayload) {
    const adminCourses = await getAdminCourseRoles(tokenData);
    const allCourses = await getCourses(token);
    const courses = findMatchingCourses(adminCourses, allCourses);
    return courses;
}
export async function accessibleCourses(tokenData: JwtPayload) {
    const courses = getUserCourseRoles(tokenData);
    console.log(courses);
    return courses;
}
export async function getCourses(token: string) {
    try {
        const url = process.env.FBS_BASE_URL
        const agent = new https.Agent({  
            rejectUnauthorized: false
          });
        const response = await axios.get(`${url}/api/v1/courses`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }, 
            httpsAgent: agent
        });
        return response.data;
    } catch (error) {
        console.log(error);
        return -1;
    }
}

export async function getStudentCourses(token: string, tokenData: JwtPayload) {
    const studentCourses = getStudentCourseRoles(tokenData);
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

export async function allQuestionInCourse(tokenData: JwtPayload, courseId: number) {
    if(!authenticateInCourse(tokenData, CourseAccess.tutorInCourse, courseId)) {
        return -1;
    }
    const data = await getAllQuestionsInCourse(courseId);
    if(data === null) {
        return -1;
    }
    return data;

}
