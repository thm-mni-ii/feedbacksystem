package de.thm.ii.fbs.types

import com.fasterxml.jackson.annotation.JsonProperty

import java.util.Optional

/**
  * Class that holds the Task sections
  *
  * @param sections the reference Queries
  */
class TaskQueries(@JsonProperty("sections") val sections: Array[TaskQuery], @JsonProperty("dbType") val dbType: String)

/**
  *
  * This class represents the Queries in an sql task
  * and have descriptions containing information why they
  * would be incorrect
  *
  * @param description description of Query (mistakes or 'ok')
  * @param query       string of the sql query
  * @param order       order fix or variable
  * @author Vlad Sokyrskyy
  */
class TaskQuery(@JsonProperty("description") val description: String, @JsonProperty("query") var query: String, @JsonProperty("order") val order: String)
