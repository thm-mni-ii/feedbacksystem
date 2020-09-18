package de.thm.ii.fbs.services

import de.thm.ii.fbs.services.labels.SettingDBLabels
import de.thm.ii.fbs.util.DB
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
     val parsedVal = typeConverter(typ, value.toString)

    1 >= DB.update("INSERT into setting (setting_val, setting_key, setting_typ) VALUES (?, ?, ?) " +
      " ON DUPLICATE KEY UPDATE setting_val = ?, setting_typ = ?",
      value, key, typ, parsedVal, typ)
  }

  /**
    * Delete a settings entry
    * @param key the settings key
    * @return deletion succeeds
    */
  def deleteByKey(key: String): Boolean = {
    1 >= DB.update("DELETE from setting where setting_key = ?", key)
  }

  private def typeConverter(typ: String, data: String): Any = {
    typ match {
      case "BOOL" => data.toBoolean
      case "INT" => data.toInt
      case "FLOAT" => data.toFloat
      case _ => data.toString
    }
  }

  /**
    * get all settings entry, some are parsed
    * @return list of settings
    */
  def getAll(): List[Map[String, Any]] = {
    DB.query("SELECT * FROM setting", (res, _) => {
      Map(SettingDBLabels.setting_key -> res.getString(SettingDBLabels.setting_key),
        SettingDBLabels.setting_typ -> res.getString(SettingDBLabels.setting_typ),
        SettingDBLabels.setting_val -> typeConverter(res.getString("setting_typ"), res.getString(SettingDBLabels.setting_val))
      )
    })
  }

  /**
    * load setting by its unique key nad convert by settings typ to correct type. Can also return an empty option
    * @author Benjamin Manns
    * @param key settings key
    * @return Option of settings entry, might be empty
    */
  def loadSetting(key: String): Option[Any] = {
    val list = DB.query("SELECT * FROM setting where setting_key = ?", (res, _) => {
      typeConverter(res.getString("setting_typ"), res.getString(SettingDBLabels.setting_val))
    }, key)
    list.headOption
  }
}
