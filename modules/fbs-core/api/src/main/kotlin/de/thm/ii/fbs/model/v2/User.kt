package de.thm.ii.fbs.model.v2

import com.fasterxml.jackson.databind.util.ClassUtil
import java.security.Principal

import com.fasterxml.jackson.module.scala.JsonScalaEnumeration
import org.json.JSONObject

/**
 * User object
 * @param id local DB's userid
 * @param prename User's prename
 * @param surname User's surname
 * @param email User's email
 * @param username User's username
 * @param globalRole User's role id
 * @param alias the DB password hash
 */
class User(val prename: String, val surname: String, val email: String,
           val username: String, val globalRole: GlobalRole,
           val alias: String?, val id: Int = 0): Principal {
    /**
     * @return unique username
     */
    override fun getName(): String = username

    /**
     * @param role A global role
     * @param roles Optional set of roles
     * @return Returns true exactly if the users global role is any of the given role.
     */
    fun hasRole(role: GlobalRole, vararg roles: GlobalRole): Boolean{
        return globalRole == role || roles.contains(globalRole)
    }

    /**
     * Compares objects instances: two users are equal if they have the same username
     * @param other Other user
     * @return true, if they have the same username.
     */
    fun equals(other: Any): Boolean {
       return when(other) {
           is User -> username == other.username
           is Principal -> username == other.name
           is Participant -> username == other.user.name
           else -> false
       }
    }

    /**
     * @return Hashcode of a user object
     */
    override fun hashCode(): Int {
        val state = username.asSequence()
        return state.map { it.hashCode() }.reduce { acc, i -> 31 * acc + i }
    }
    /**
     * @return JSON representation of a user object
     */
    fun toJson(): JSONObject {
      return JSONObject().put("prename", prename)
              .put("username", username)
              .put("surname", surname)
              .put("id", id)
    }
}
