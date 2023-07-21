package de.thm.ii.fbs.model.v2

object storageFileName {
    const val MAIN_FILE = "main-file"
    const val SECONDARY_FILE = "secondary-file"
    const val SUBTASK_FILE = "subtask-file"
    const val SOLUTION_FILE = "solution-file"

    /**
     * Get a File Path for Minio.
     *
     * <strong>Warning</strong>: these paths should only be used with minio, as they do not use the correct separator for the current operating system
     *
     */
    fun getFilePath(id: Int, name: String): String  {
        return "$id/$name"
    }

    /**
     * Get the Main File Path for Minio.
     *
     * <strong>Warning</strong>: these paths should only be used with minio, as they do not use the correct separator for the current operating system
     *
     * @param ccid the Checker Configuration Id
     */
    fun getMainFilePath(ccid: Int): String {
        return getFilePath(ccid, MAIN_FILE)
    }

    /**
     * Get the Secondary File Path for Minio.
     *
     * <strong>Warning</strong>: these paths should only be used with minio, as they do not use the correct separator for the current operating system
     *
     * @param ccid the Checker Configuration Id
     */
    fun getSecondaryFilePath(ccid: Int): String {
        return getFilePath(ccid, SECONDARY_FILE)
    }

    /**
     * Get th Solution File Path for Minio.
     *
     * <strong>Warning</strong>: these paths should only be used with minio, as they do not use the correct separator for the current operating system
     *
     * @param sid the Submission Id
     */
    fun getSolutionFilePath(sid: Int): String {
        return getFilePath(sid, SOLUTION_FILE)
    }
}