package de.thm.ii.fbs.model

object storageFileName {
  final val MAIN_FILE = "main-file"
  final val SECONDARY_FILE = "secondary-file"
  final val SUBTASK_FILE = "subtask-file"
  final val SOLUTION_FILE = "solution-file"

  /**
    * Get a File Path for Minio.
    *
    * <strong>Warning</strong>: these paths should only be used with minio, as they do not use the correct separator for the current operating system
    *
    */
  def getFilePath(id: Int, name: String): String = {
    s"$id/$name"
  }

  /**
    * Get the Main File Path for Minio.
    *
    * <strong>Warning</strong>: these paths should only be used with minio, as they do not use the correct separator for the current operating system
    *
    * @param ccid the Checker Configuration Id
    */
  def getMainFilePath(ccid: Int): String = {
    getFilePath(ccid, MAIN_FILE)
  }

  /**
    * Get the Secondary File Path for Minio.
    *
    * <strong>Warning</strong>: these paths should only be used with minio, as they do not use the correct separator for the current operating system
    *
    * @param ccid the Checker Configuration Id
    */
  def getSecondaryFilePath(ccid: Int): String = {
    getFilePath(ccid, SECONDARY_FILE)
  }

  /**
    * Get th Solution File Path for Minio.
    *
    * <strong>Warning</strong>: these paths should only be used with minio, as they do not use the correct separator for the current operating system
    *
    * @param sid the Submission Id
    */
  def getSolutionFilePath(sid: Int): String = {
    getFilePath(sid, SOLUTION_FILE)
  }
}
