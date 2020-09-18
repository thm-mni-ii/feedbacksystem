package de.thm.ii.fbs.services

import java.security.MessageDigest
import de.thm.ii.fbs.security.Secrets
import de.thm.ii.fbs.util.DB
import org.springframework.beans.factory.annotation.{Autowired, Value}
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

/**
  * Enable communication with Tasks and their Results
  *
  * @author Benjamin Manns
  */
@Component
class TokenService {
  @Autowired
  private implicit val jdbc: JdbcTemplate = null

  @Value("${url.expiration.time}")
  private val urlExpirationTime: String = null
  /**
    * validate a token, primaliy provided to protect download URL to let them access only within a time
    * @param token a token hash
    * @param valid_for_id id which is protected
    * @param token_type defined the type of the ID
    * @return if token is valid or not
    */
  def tokenIsValid(token: String, valid_for_id: Int, token_type: String): Boolean = {
    val list = DB.query("select *, CURRENT_TIMESTAMP() as now from token where token_hash = ? and" +
      " valid_for_id = ? and token_type = ? and CURRENT_TIMESTAMP() < valid_until and not used",
      (res, _) => res.getString("valid_for_id"),
      token, valid_for_id, token_type)
    def lines = DB.update("update token set used = 1 where token_hash = ?", token)
    list.nonEmpty && lines > 0
  }

  /**
    * generate a URL validation token
    * @author Benjamin Manns
    * @param valid_for_id ID which is protected
    * @param token_type which type ID has
    * @return a token string
    */
  def generateValidToken(valid_for_id: Int, token_type: String): String = {
    val md = MessageDigest.getInstance("SHA-1")
    val token = md.digest(Secrets.getRandomStringByDateNow().getBytes("UTF-8")).map("%02x".format(_)).mkString // generated

    DB.update("insert into token (token_hash, valid_for_id, token_type, valid_until) VALUES " +
      "(?, ?, ?, from_unixtime(UNIX_TIMESTAMP() + " + urlExpirationTime + "))",
      token, valid_for_id, token_type)

    token
  }
}
