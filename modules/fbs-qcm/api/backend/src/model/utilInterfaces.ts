import { ObjectId } from 'mongodb';

export interface questionInCatalogObject {
    _id: string,
    question: string,
    catalog: string,
    weighting: number,
    children: questionInCatalogObjectChild[]
}

interface questionInCatalogObjectChild {
    needed_score: number,
    question: string,
    transition: string
}

export interface Course {
    id: number
}

export interface CatalogInCourseObject {
    _id: string,
    course: number,
    catalog: string,
    requirements: CatalogInCourseObject[]
}

export interface Skill {
    _id: string
    course: number,
    name: string,
    requirements: string[]
}

export interface SkillInsertion {
    course: number,
    name: ObjectId,
    requirements: ObjectId[]
}

export interface QuestionInSkill {
    _id: string,
    skillId: string,
    questionId: string
}

export interface QuestionInSkillInsertion {
    skillId: ObjectId,
    questionId: ObjectId
}