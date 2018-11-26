package de.thm.submissioncheck

/**
  * @author Vlad Sokyrsky
  */
object SQLChecker extends App{
  /*
  var s = new TaskQuery("ok", "select *\nfrom hotel")
  var sx = Array(s)
  var task1: SQLTask = new SQLTask("sql-checker1", sx, "")
*/
  /**
    * Class instance dbid
    */
  var dbid: Int = 0

  /**
    * create a new id for a database
    * @return dbid
    */
  def newID(): Int = {
    dbid + 1
  }

}
