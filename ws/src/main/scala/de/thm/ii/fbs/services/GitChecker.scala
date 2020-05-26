package de.thm.ii.fbs.services

/**
  * Static GitChecker configurations.
  * @author Andrej Sajenko
  */
object GitChecker {
  private def system(name: String, id: String, acceptedInput: Int,
                     desc: String = null, port: String = null, ip: String = null, formats: String = null,
                     testfiles: List[Map[String, Any]] = List()): Map[String, Any] = Map(
    "name" -> name,
    "testsystem_id" -> id,
    "description" -> desc,
    "machine_port" -> port,
    "machine_ip" -> ip,
    "supported_formats" -> formats,
    "testfiles" -> testfiles,
    "accepted_input" -> acceptedInput
  )

  private def testfile(id: String, name: String, required: Boolean = false): Map[String, Any] = Map(
    "testsystem_id" -> id,
    "filename" -> name,
    "required" -> required
  )

  /**
    * Registered checker configurations
    */
  val CHECKERS = Map[String, Map[String, Any]](
    "gitchecker" -> system(name = "gitchecker", id = "gitchecker", acceptedInput = 1, testfiles = List(
      testfile("gitchecker", "config.json"),
      testfile("gitchecker", "structurecheck", required = true)
    )),
    "gitstatschecker" -> system(name = "gitstatschecker", id = "gitstatschecker", acceptedInput = 4, testfiles = List()),
    "multiplechoicechecker"-> system(name = " Multiple Choice Checker ", id = "multiplechoicechecker", acceptedInput = 4, port = "0", testfiles = List(
      testfile("multiplechoicechecker", "exercise.csv", required = true)
    )),
    "nodechecker"-> system(name = "Node Checker", id = "nodechecker",
      desc = "Provides Node Docker with Pupeteer for Testing JavaScript", acceptedInput = 2, testfiles = List(
      testfile("nodechecker", "nodetest.zip", required = true)
    )),
    "plagiarismchecker"-> system(name = "plagiarismchecker", id = "plagiarismchecker", acceptedInput = 0, testfiles = List(
      testfile("plagiarismchecker", "config.json", required = true)
    )),
    "sapabapchecker"-> system(name = "ABAP Testsystem", id = "sapabapchecker", desc = "ABAP code will be executed in a real SAP system",
      acceptedInput = 3, testfiles = List()),
    "secrettokenchecker"-> system(name = "Secretoken Checker", id = "secrettokenchecker", desc = "Secrettoken", port = "8080",
      ip = "000.000.000.000", acceptedInput = 3, testfiles = List(
        testfile("secrettokenchecker", "scriptfile", required = true),
        testfile("secrettokenchecker", "testfile")
      )),
    "sqlchecker" -> system(name = "SQL Checker", id = "sqlchecker", desc = "SQL Checker", port = "1234",
      ip = "000.000.000.000", acceptedInput = 3, formats = ".sql, ", testfiles = List(
        testfile("sqlchecker", "sections.json", required = true),
        testfile("sqlchecker", "db.sql", required = true)
      ))
  )

  private def setting(typ: String, value: String, key: String): Map[String, String] = Map(
    "setting_key" -> key,
    "setting_typ" -> typ,
    "setting_val" -> value
  )

  /**
    * The settings for a testsystem.
    */
  val SETTINGS: Map[String, Map[String, String]] = Map(
    "gitchecker" -> setting("TEXT", "8g1Ejpjh3N2oQKfpTNok", "GITLAB_API_KEY")
  )

  /**
    * Registered checker configurations
    */
  val checkers = Map(
    "gitchecker" -> """{
            |    "name": "gitchecker",
            |    "testsystem_id": "gitchecker",
            |    "description": "null",
            |    "machine_port": null,
            |    "machine_ip": "null",
            |    "supported_formats": "null",
            |    "testfiles": [{
            |      "testsystem_id": "gitchecker",
            |      "filename": "config.json",
            |      "required": false
            |    }, {
            |      "testsystem_id": "gitchecker",
            |      "filename": "structurecheck",
            |      "required": true
            |    }],
            |    "accepted_input": 1
            |  }""".stripMargin,
    "gitstatschecker" -> """{
            |    "name": "gitstatschecker",
            |    "testsystem_id": "gitstatschecker",
            |    "description": null,
            |    "machine_port": null,
            |    "machine_ip": null,
            |    "supported_formats": null,
            |    "testfiles": [],
            |    "accepted_input": 4
            |  }""".stripMargin,
    "multiplechoicechecker" -> """{
                                 |    "name": " Multiple Choice Checker ",
                                 |    "testsystem_id": "multiplechoicechecker",
                                 |    "description": "",
                                 |    "machine_port": "0",
                                 |    "machine_ip": "",
                                 |    "supported_formats": "",
                                 |    "testfiles": [{
                                 |      "testsystem_id": "multiplechoicechecker",
                                 |      "filename": "exercise.csv",
                                 |      "required": true
                                 |    }],
                                 |    "accepted_input": 4
                                 |  }""".stripMargin,
    "nodechecker" -> """{
            |    "name": "Node Checker",
            |    "testsystem_id": "nodechecker",
            |    "description": "Provides Node Docker with Pupeteer for Testing JavaScript",
            |    "machine_port": null,
            |    "machine_ip": null,
            |    "supported_formats": null,
            |    "testfiles": [{
            |      "testsystem_id": "nodechecker",
            |      "filename": "nodetest.zip",
            |      "required": true
            |    }],
            |    "accepted_input": 2
            |  }""".stripMargin,
    "plagiarismchecker" -> """{
                             |    "name": "plagiarismchecker",
                             |    "testsystem_id": "plagiarismchecker",
                             |    "description": null,
                             |    "machine_port": null,
                             |    "machine_ip": null,
                             |    "supported_formats": null,
                             |    "testfiles": [{
                             |      "testsystem_id": "plagiarismchecker",
                             |      "filename": "config.json",
                             |      "required": true
                             |    }],
                             |    "accepted_input": 0
                             |  }""".stripMargin,
    "sapabapchecker" -> """{
                          |    "name": "ABAP Testsystem",
                          |    "testsystem_id": "sapabapchecker",
                          |    "description": "ABAP code will be executed in a real SAP system",
                          |    "machine_port": null,
                          |    "machine_ip": null,
                          |    "supported_formats": "",
                          |    "testfiles": [],
                          |    "accepted_input": 3
                          |  }""".stripMargin,
    "secrettokenchecker" -> """{
                              |    "name": "Secretoken Checker",
                              |    "testsystem_id": "secrettokenchecker",
                              |    "description": "Sectretoken",
                              |    "machine_port": "8000",
                              |    "machine_ip": "000.000.000.000",
                              |    "supported_formats": "BASH",
                              |    "testfiles": [{
                              |      "testsystem_id": "secrettokenchecker",
                              |      "filename": "scriptfile",
                              |      "required": true
                              |    }, {
                              |      "testsystem_id": "secrettokenchecker",
                              |      "filename": "testfile",
                              |      "required": false
                              |    }],
                              |    "accepted_input": 3
                              |  }""".stripMargin,
    "sqlchecker" -> """{
                      |    "name": "SQL Checker",
                      |    "testsystem_id": "sqlchecker",
                      |    "description": "XXXXX",
                      |    "machine_port": "1234",
                      |    "machine_ip": "000.000.000.000",
                      |    "supported_formats": ".sql, ",
                      |    "testfiles": [{
                      |      "testsystem_id": "sqlchecker",
                      |      "filename": "sections.json",
                      |      "required": true
                      |    }, {
                      |      "testsystem_id": "sqlchecker",
                      |      "filename": "db.sql",
                      |      "required": true
                      |    }],
                      |    "accepted_input": 3
                      |  }""".stripMargin

  )
}
