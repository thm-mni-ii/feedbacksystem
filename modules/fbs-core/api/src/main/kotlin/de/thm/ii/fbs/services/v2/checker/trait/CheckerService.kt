package de.thm.ii.fbs.services.v2.checker.trait

import de.thm.ii.fbs.model.v2.CheckrunnerConfiguration
import de.thm.ii.fbs.model.v2.User

open class CheckerService {
    /**
     * Notify about the new submission
     *
     * @param taskID       the taskID for the submission
     * @param submissionID the id of the sumission
     * @param cc           the check runner of the sumission
     * @param fu           the user which triggered the sumission
     */
    open fun notify(taskID: Int, submissionID: Int, cc: CheckrunnerConfiguration, fu: User) {}
}