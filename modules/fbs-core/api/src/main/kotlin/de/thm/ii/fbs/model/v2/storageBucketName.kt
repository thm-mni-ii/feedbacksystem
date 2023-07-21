package de.thm.ii.fbs.model.v2

object storageBucketName {
    const val SUBMISSIONS_BUCKET = "submissions"
    const val CHECKER_CONFIGURATION_BUCKET = "checker-configuration"
    /** This folder should only be used for old tasks to avoid breaking backwards compatibility */
    const val CHECKER_CONFIGURATION_FOLDER = "tasks"
}