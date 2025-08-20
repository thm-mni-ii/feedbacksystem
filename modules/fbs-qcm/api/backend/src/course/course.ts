import { JwtPayload } from "jsonwebtoken";
import { connect } from "../mongo/mongo";
import {
  checkCourseAccess,
  getAdminCourseRoles,
  getAllQuestionsInCourse,
  getStudentCourseRoles,
  getUserCourseRoles,
} from "../utils/utils";
import * as mongoDB from "mongodb";
import axios from "axios";
import https from "https";
import { authenticateInCourse } from "../authenticate";
import { CourseAccess } from "../utils/enum";
import { Course } from "../model/utilInterfaces";

export async function accessibleCourses(tokenData: JwtPayload) {
  const courses = getUserCourseRoles(tokenData);
  return courses;
}

export async function getCourses(token: string) {
  try {
    const url = process.env.FBS_BASE_URL;
    const agent = new https.Agent({
      rejectUnauthorized: false,
    });

    const response = await axios.get(`${url}/api/v1/courses`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      httpsAgent: agent,
    } as any);
    return response.data as Course[];
  } catch (error) {
    console.log(error);
    return -1;
  }
}

export async function allQuestionInCourse(
  tokenData: JwtPayload,
  courseId: number
) {
  if (!authenticateInCourse(tokenData, CourseAccess.tutorInCourse, courseId)) {
    return -1;
  }
  const data = await getAllQuestionsInCourse(courseId);
  if (data === null) {
    return -1;
  }
  return data;
}
