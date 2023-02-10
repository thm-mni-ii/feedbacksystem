package de.thm.ii.fbs.model.v2.checkerEvent

import de.thm.ii.fbs.model.v2.checkerEvent.action.SubmissionActions

class SubmissionEvent(override var action: SubmissionActions) :
    CheckerEvent<SubmissionActions>(action) {
    override var eventType: String = "SUBMISSION_EVENT"
}