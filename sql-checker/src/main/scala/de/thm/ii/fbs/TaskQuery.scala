package de.thm.ii.fbs

/**
 *
 * This class represents the Queries in an sql task
 * and have descriptions containing information why they
 * would be incorrect
 *
 * @param description description of Query (mistakes or 'ok')
 * @param query string of the sql query
 * @param order order fix or variable
 * @author Vlad Sokyrskyy
 */
class TaskQuery(var description: String, var query: String, var order: String)
