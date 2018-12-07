package de.thm.submissioncheck

/**
 *
 * This class represents the Queries in an sql task
 * and have descriptions containing information why they
 * would be incorrect
 *
 * @param desc description of Query (mistakes or 'ok')
 * @param content string of the sql query
 * @author Vlad Sokyrskyy
 */
class TaskQuery(val desc: String, val content: String){
    /**
      * class instance description
      */
    var description: String = desc

    /**
      * class instance query
      */
    var query: String = content
}
