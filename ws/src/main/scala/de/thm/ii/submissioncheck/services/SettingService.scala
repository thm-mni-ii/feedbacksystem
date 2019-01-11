package de.thm.ii.submissioncheck.services

import de.thm.ii.submissioncheck.misc.{BadRequestException, DB, ResourceNotFoundException}
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
    * insert / update a speciel setting, settings keys are unique
    * @author Benjamin Manns
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
    List(0, 1).contains(DB.update("INSERT into setting (setting_val, setting_key, setting_typ) VALUES (?, ?, ?) " +
      " ON DUPLICATE KEY UPDATE setting_val = ?, setting_typ = ?",
      value, key, typ, value, typ))
  }

  /**
    * load setting by its unique key nad convert by settings typ to correct type. Can also return an empty option
    * @author Benjamin Manns
    * @param key settings key
    * @return Option of settings entry, might be empty
    */
  def loadSetting(key: String): Option[Any] = {
    val list = DB.query("SELECT * FROM setting where setting_key = ?", (res, _) => {
      res.getString("setting_typ") match {
        case "BOOL" => res.getBoolean(SettingDBLabels.setting_val)
        case "TEXT" => res.getString(SettingDBLabels.setting_val)
        case _ => res.getString(SettingDBLabels.setting_val)
      }
    }, key)
    list.headOption
  }
}
