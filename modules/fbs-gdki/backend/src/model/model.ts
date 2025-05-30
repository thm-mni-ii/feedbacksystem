import * as mongoDB from "mongodb";

export interface editCodeStorageFinder {
    taskId: number,
    userId: string
}

export interface task {
    _id: mongoDB.ObjectId,
    text: string,
    result: string,
    isPublic: boolean
}

export interface token {
    sub: string,
    id: number,
    globalRole: string,
    courseRoles: string,
    iat: string,
    exp: string
}
