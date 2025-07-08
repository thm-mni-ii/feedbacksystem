import type Skill from '@/model/Skill'
import axios, { type AxiosResponse } from 'axios'

class SkillService {
  getSkills(courseId: string): Promise<AxiosResponse<Skill[]>> {
    console.log(typeof courseId)
    return axios.get(`/api_v1/courseSkills/${courseId}`, {
      headers: {
        authorization: `Bearer ${localStorage.getItem('jsessionid')}`
      }
    })
  }

  getSkill(skillId: string): Promise<AxiosResponse<Skill>> {
    return axios.get(`/api_v1/getSkill/${skillId}`, {
      headers: {
        authorization: `Bearer ${localStorage.getItem('jsessionid')}`
      }
    })
  }

  getAllStudyProgress(courseId: string) {
    // Beispielroute, ggf. anpassen, wenn du eine eigene Progress-Route hast
    return axios.get(`/api_v1/skillProgress/${courseId}`, {
      headers: {
        authorization: `Bearer ${localStorage.getItem('jsessionid')}`
      }
    })
  }

  createNewSkill(skill: Skill) {
    return axios.post(`/api_v1/createSkill/`, skill, {
      headers: {
        authorization: `Bearer ${localStorage.getItem('jsessionid')}`
      }
    })
  }

  editSkill(skillId: string, skill: Skill) {
    return axios.put(`/api_v1/editSkill/${skillId}`, skill, {
      headers: {
        authorization: `Bearer ${localStorage.getItem('jsessionid')}`
      }
    })
  }

  removeQuestionFromSkill(skillId: string, questionId: string) {
    return axios.delete(`/api_v1/removeQuestionFromSkill/${skillId}/${questionId}`, {
      headers: {
        authorization: `Bearer ${localStorage.getItem('jsessionid')}`
      }
    })
  }

  addQuestionToSkill(skillId: string, questionId: string) {
    return axios.put(
      `/api_v1/addQuestionToSkill/${skillId}/${questionId}`,
      {},
      {
        headers: {
          authorization: `Bearer ${localStorage.getItem('jsessionid')}`
        }
      }
    )
  }
}

export default new SkillService()
