package de.thm.ii.fbs.model.v2.checkerEvent

import de.thm.ii.fbs.model.v2.checkerEvent.action.PlaygroundActions

class PlaygroundEvent(override var action: PlaygroundActions) :
    CheckerEvent<PlaygroundActions>(action) {
    override var eventType: String = "PLAYGROUND_EVENT"
}