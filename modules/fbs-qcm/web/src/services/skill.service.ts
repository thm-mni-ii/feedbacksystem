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

const skill = {
  id: 4,
  name: 'C++',
  difficulty: 4,
  description:
    'C++ is used to create computer programs, and is one of the most used language in game development.'
} as Skill

const studyProgress = [
  { skillId: 1, progress: 23 },
  { skillId: 2, progress: 65 },
  { skillId: 3, progress: 47 },
  { skillId: 4, progress: 82 }
]

class SkillService {
  getSkills(courseId: number): Promise<AxiosResponse<Skill[]>> {
    return Promise.resolve({
      data: skillData as AxiosResponse<Skill[]>
    })
    // return axios.get(
    //   `/api_v1/courseSkills/${courseId}`,
    //   {
    //     headers: {
    //       authorization: `Bearer ${localStorage.getItem('jsessionid')}`
    //     }
    //   }
    // )
  }
  getSkill(skillId: string): Promise<AxiosResponse<Skill>> {
    return Promise.resolve({
      data: skill as AxiosResponse<Skill>
    })
    // return axios.get(
    //   `/api_v1/skills/${skillId}`,
    //   {
    //     headers: {
    //       authorization: `Bearer ${localStorage.getItem('jsessionid')}`
    //     }
    //   }
    // )
  }
  getAllStudyProgress(courseId: number) {
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
  createNewSkill(courseId: number, skill: Skill) {
    return axios.post(`/api_v1/skill/`, skill, {
      headers: {
        authorization: `Bearer ${localStorage.getItem('jsessionid')}`
      }
    })
  }
  editSkill(skill: Skill) {
    return axios.put(`/api_v1/skill/`, skill, {
      headers: {
        authorization: `Bearer ${localStorage.getItem('jsessionid')}`
      }
    })
  }
  removeQuestion(questionId: number) {
    console.log(questionId)
    console.log('REMOVE QUESTION FROM SKILL')
    // return axios.delete(`/api_v1/skill/removeQuestion`, question, {
    //   headers: {
    //     authorization: `Bearer ${localStorage.getItem('jsessionid')}`
    //   }
    // })
  }
}

export default new SkillService()
