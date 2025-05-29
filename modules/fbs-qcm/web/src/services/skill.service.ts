import type Skill from '@/model/Skill'
import axios, { type AxiosResponse } from 'axios'

const skillData = [
  {
    id: 1,
    name: 'SQL',
    difficulty: 3,
    description:
      'learn about the standard language for storing, manipulating and retrieving data in databases'
  },
  {
    id: 2,
    name: 'Python',
    difficulty: 1,
    description: 'A high-level, general-purpose programming language. '
  },
  {
    id: 3,
    name: 'Javascript',
    difficulty: 2,
    description:
      'A programming language and core technology of the World Wide Web, alongside HTML and CSS'
  },
  {
    id: 4,
    name: 'C++',
    difficulty: 4,
    description:
      'C++ is used to create computer programs, and is one of the most used language in game development.'
  }
]

const studyProgress = [23, 65, 32, 54]

class SkillService {
  getSkills(courseId: number): Promise<AxiosResponse<Skill[]>> {
    return Promise.resolve({
      data: skillData as AxiosResponse<Skill[]>
    })
    // return axios.get(
    //   `api_v1/courseSkills/${courseId}`,
    //   {
    //     headers: {
    //       authorization: `Bearer ${localStorage.getItem('jsessionid')}`
    //     }
    //   }
    // )
  }
  getStudyProgress(courseId: number, skillId: number) {
    return Promise.resolve({
      data: studyProgress as AxiosResponse<[]>
    })

    // return axios.get(
    //   `api_v1/skillProgress/${course.id}/${skillId}`,
    //   {
    //     headers: {
    //       authorization: `Bearer ${localStorage.getItem('jsessionid')}`
    //     }
    //   }
    // )
  }
}

export default new SkillService()
