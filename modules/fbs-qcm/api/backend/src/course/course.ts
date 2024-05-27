import { JwtPayload } from "jsonwebtoken";
import { connect } from "../mongo/mongo";
import { getAdminCourseRoles, getElementFromArray, getCatalogPermission, getUserCourseRoles } from "../utils/utils";
import * as mongoDB from "mongodb";

export async function getTeacherCourses(tokenData: JwtPayload) {
    const adminCourses = await getAdminCourseRoles(tokenData);
    const database: mongoDB.Db = await connect();
    const courseCollection: mongoDB.Collection = database.collection("course");
    const query = {
        courseId: {$in: adminCourses}
    }
    const courses = await courseCollection.find(query).toArray();
    if(courses == null || courses.length == 0) {
        return -1;
    }
    return courses;
}
export async function getStudentCourses(tokenData: JwtPayload) {
    const studentCourses = await getUserCourseRoles(tokenData);
    const database: mongoDB.Db = await connect();
    const courseCollection: mongoDB.Collection = database.collection("course");
    const query = {
        courseId: {$in: studentCourses}
    }
    const courses = await courseCollection.find(query).toArray();
    if(courses == null || courses.length == 0) {
        return -1;
    }
    return courses;
}
