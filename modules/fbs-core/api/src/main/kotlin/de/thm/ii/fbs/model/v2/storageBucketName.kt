package de.thm.ii.fbs.model.v2

object storageBucketName {
    final val SUBMISSIONS_BUCKET = "submissions"
    final val CHECKER_CONFIGURATION_BUCKET = "checker-configuration"
    /** This folder should only be used for old tasks to avoid breaking backwards compatibility */
    final val CHECKER_CONFIGURATION_FOLDER = "tasks"
}