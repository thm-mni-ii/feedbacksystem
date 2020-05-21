package de.thm.ii.fbs.services

/**
  * Static GitChecker configurations.
  * @author Andrej Sajenko
  */
object GitChecker {
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
