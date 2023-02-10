package de.thm.ii.fbs.model.v2.checkerEvent

import de.thm.ii.fbs.model.v2.checkerEvent.action.CheckConfigurationActions

class CheckConfigurationEvent(override var action: CheckConfigurationActions) :
    CheckerEvent<CheckConfigurationActions>(action) {
    override var eventType: String = "CHECK_CONFIGURATION_EVENT"
}