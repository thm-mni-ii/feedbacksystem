import type Course from '@/model/Course'
import axios, { type AxiosResponse } from 'axios'

class CourseService {
  getMyCourses(): Promise<AxiosResponse<Course[]>> {
    return axios.get(`core/users/${localStorage.getItem('userId')}/courses`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('jsessionid')}`
      }
    })
  }
  getCourse(courseId: number): Promise<AxiosResponse<Course[]>> {
    return axios.get(`/api_v1/catalogs/${courseId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('jsessionid')}`
      }
    })
  }
  getCoreCourse(courseId: number): Promise<AxiosResponse<Course[]>> {
    return axios.get(`https://localhost/api/v1/courses/${courseId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('jsessionid')}`
      }
    })
  }
  getSkillsInCourse(courseId: number): Promise<AxiosResponse<Course[]>> {
    return axios.get(`/api_v1/catalogs/${courseId}`, {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('jsessionid')}`
      }
    })
  }
}

export default new CourseService()
