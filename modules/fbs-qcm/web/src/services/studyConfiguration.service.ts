import apiV2 from '@/services/apiV2Client'
import type {
  CourseStudyConfiguration,
  StudyAlgorithmOverrides
} from '@/model/StudyAlgorithmConfig'

class StudyConfigurationService {
  async get(courseId: string): Promise<CourseStudyConfiguration> {
    const response = await apiV2.get<CourseStudyConfiguration>(
      `/courses/${courseId}/study-configuration`
    )
    return response.data
  }

  async update(
    courseId: string,
    revision: number,
    overrides: StudyAlgorithmOverrides
  ): Promise<CourseStudyConfiguration> {
    const response = await apiV2.put<CourseStudyConfiguration>(
      `/courses/${courseId}/study-configuration`,
      { revision, overrides }
    )
    return response.data
  }

  async reset(courseId: string, revision: number): Promise<CourseStudyConfiguration> {
    const response = await apiV2.delete<CourseStudyConfiguration>(
      `/courses/${courseId}/study-configuration`,
      { data: { revision } }
    )
    return response.data
  }
}

export default new StudyConfigurationService()
