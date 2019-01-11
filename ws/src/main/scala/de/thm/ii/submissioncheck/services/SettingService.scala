package de.thm.ii.submissioncheck.services

import java.io
import java.nio.file.{Files, Path, Paths}
import java.sql.{Connection, Statement}
import java.util.zip.{ZipEntry, ZipOutputStream}

import de.thm.ii.submissioncheck.misc.{BadRequestException, DB, ResourceNotFoundException}
import de.thm.ii.submissioncheck.model.User
import de.thm.ii.submissioncheck.security.Secrets
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

/**
  * CourseService provides interaction with DB
  *
  * @author Benjamin Manns
  */
@Component
class SettingService {
  @Autowired
  private implicit val jdbc: JdbcTemplate = null

  /**
    *
    * @param key settings key
    * @param value settings value, could be anything, but is a text field in DB
    * @param typ settings typ, if one wants to load data, they will be parsed as this
    * @return Boolean if update succeeded
    */
  def insertOrUpdateSetting(key: String, value: Any, typ: String): Boolean = {
    // Todo make a list in properties which keys are allowed
    val allowedKeys: List[String] = List("privacy.privacy_text", "privacy.impressum_text", "privacy.show")
    if (!allowedKeys.contains(key)) {
      throw new NotImplementedError("Your key: `" + key + "` is not implemented yet")
    }
    List(0, 1).contains(DB.update("INSERT into setting (setting_val,setting_key, setting_typ) VALUES (?, ?, ?) " +
      " ON DUPLICATE KEY UPDATE setting_val = ?, setting_typ = ?",
      value, key, typ, value, typ))
  }

}
