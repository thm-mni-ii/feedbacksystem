package de.thm.ii.submissioncheck

/**
 *
 * This class represents the Queries in an sql task
 * and have descriptions containing information why they
 * would be incorrect
 *
 * @param desc description of Query (mistakes or 'ok')
 * @param content string of the sql query
 * @param ord order fix or variable
 * @author Vlad Sokyrskyy
 */
class TaskQuery(val desc: String, val content: String, val ord: String){
    /**
      * class instance description
      */
    var description: String = desc

    /**
      * class instance query
      */
    var query: String = content

    /**
      * class instance order
      */
    var order: String = ord
}
