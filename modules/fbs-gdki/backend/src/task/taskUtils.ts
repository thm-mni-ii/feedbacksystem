import { task } from "../model/model";

export function getTextFromTask(task: task) {
    if(task === undefined) {
        return 404;
    }
    const response = {
        text: task.text
    }
    return response
}

export function isTaskPublic(task: task) {
    return task.isPublic;
}