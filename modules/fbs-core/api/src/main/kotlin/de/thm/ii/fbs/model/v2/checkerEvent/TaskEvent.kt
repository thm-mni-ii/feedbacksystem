package de.thm.ii.fbs.model.v2.checkerEvent

import de.thm.ii.fbs.model.v2.checkerEvent.action.TaskActions

class TaskEvent(override var action: TaskActions) :
    CheckerEvent<TaskActions>(action) {
    override var eventType: String = "TASK_EVENT"
}
