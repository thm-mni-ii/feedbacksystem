package de.thm.ii.fbs.types

import com.fasterxml.jackson.annotation.JsonProperty

/**
  * Class that stores the user data
  *
  * @param id       the user id
  * @param username the user name
  */
class User(@JsonProperty("id") val id: Int,
           @JsonProperty("username") val username: String)
