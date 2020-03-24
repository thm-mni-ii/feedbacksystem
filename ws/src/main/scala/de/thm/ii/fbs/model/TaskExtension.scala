package de.thm.ii.fbs.model

/**
  * Modal for table "task_extension", which provides extended information about the task for a user
  * @param taskid task ID
  * @param userid user ID
  * @param subject type / handler of information
  * @param data data encoded as string (json, base64, ...)+
  * @param info_typ what kind of data is stored (string / file)
  */
class TaskExtension(val taskid: Int, val userid: Int, val subject: String, val data: String, val info_typ: String) {
  /**
    * object as map
    * @return scala Map of object
    */
  def toMap: Map[String, Any] = {
    Map("taskid" -> this.taskid, "userid" -> this.userid, "subject" -> this.subject, "data" -> this.data, "info_typ" -> this.info_typ)
  }

  /**
    * Print TaskExtension more readable
    * @return TaskExtension object as string
    */
  override def toString: String = {
    toMap.toString
  }
}
