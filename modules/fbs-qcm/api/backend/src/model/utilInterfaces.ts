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