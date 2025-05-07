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
}

export default new CourseService()
