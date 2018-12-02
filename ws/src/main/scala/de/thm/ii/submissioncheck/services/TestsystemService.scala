package de.thm.ii.submissioncheck.services

import java.io
import java.sql.{Connection, SQLException, Statement}

import de.thm.ii.submissioncheck.misc.{BadRequestException, DB, ResourceNotFoundException}
import de.thm.ii.submissioncheck.model.User
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

/**
  * CourseService provides interaction with DB
  *
  * @author Benjamin Manns
  */
@Component
class TestsystemService {
  @Autowired
  private implicit val jdbc: JdbcTemplate = null

  object TestsystemLabels {
    val id = "testsystem_id"
    val name = "name"
    val description = "description"
    val supported_formats = "supported_formats"
    val machine_port = "machine_port"
    val machine_ip = "machine_ip"
  }

  def insertTestsystem(id_string: String, name: String, description: String, supportedFormats: String, machinePort: Int, machineIp: String): Map[String, String] = {
    var parsedIDString = id_string.toLowerCase.replace(" ","")

    try{
      var num = DB.update(
        "insert into testsystem (testsystem_id, name, description, supported_formats, machine_port, machine_ip) values (?,?,?,?,?,?)",
        parsedIDString, name, description, supportedFormats, machinePort, machineIp)

      Map(TestsystemLabels.id -> parsedIDString)
    }
    catch {
      case _: SQLException => throw new BadRequestException("Provided testsystem name may not be unique.")
    }

  }

  def updateTestsystem(id_string: String, name: String, description: String, supportedFormats: String, machinePort: Int, mashineIp: String): Boolean = {
    DB.update("update testsystem set name = ?, description = ?, supported_formats = ?, machine_port = ?, machine_ip = ? where testsystem_id = ?",
      name, description, supportedFormats, machinePort, mashineIp, id_string) == 1
  }

  def deleteTestsystem(id_string: String): Boolean = {
    DB.update("delete from testsystem  where testsystem_id = ?", id_string) == 1
  }

  def getTestsystem(id_string: String): Option[Map[String, String]] = {
    val list = DB.query("select * from testsystem  where testsystem_id = ?", (res, _) => {
      Map(TestsystemLabels.id -> res.getString(TestsystemLabels.id),
        TestsystemLabels.name -> res.getString(TestsystemLabels.name),
        TestsystemLabels.description -> res.getString(TestsystemLabels.description),
        TestsystemLabels.supported_formats -> res.getString(TestsystemLabels.supported_formats),
        TestsystemLabels.machine_ip -> res.getString(TestsystemLabels.machine_ip),
        TestsystemLabels.machine_port -> res.getString(TestsystemLabels.machine_port))
    }, id_string)
    list.headOption

  }

  def getTestsystems(): List[Map[String, String]] = {
    DB.query("select * from testsystem", (res, _) => {
      Map(TestsystemLabels.id -> res.getString(TestsystemLabels.id),
        TestsystemLabels.name -> res.getString(TestsystemLabels.name),
        TestsystemLabels.description -> res.getString(TestsystemLabels.description),
        TestsystemLabels.supported_formats -> res.getString(TestsystemLabels.supported_formats),
        TestsystemLabels.machine_ip -> res.getString(TestsystemLabels.machine_ip),
        TestsystemLabels.machine_port -> res.getString(TestsystemLabels.machine_port))
    })
  }

}
