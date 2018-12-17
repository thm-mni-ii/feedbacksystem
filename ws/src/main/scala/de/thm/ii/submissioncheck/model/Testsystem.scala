package de.thm.ii.submissioncheck.model

import de.thm.ii.submissioncheck.services.TestsystemLabels

/**
  * Class Testsystem holds all data from the testsystem table
  * @author Benjamin Manns
  *
  * @param testsystem_id unique testsystem identification
  * @param name human readable testsystem name
  * @param description a description what admin wants to know about this system
  * @param supported_formats a list of formats machine can handle
  * @param machine_port port where machine is running on
  * @param machine_ip ip of testsystem
  */
class Testsystem(val testsystem_id: String, val name: String, val description: String, val supported_formats: String,
                 machine_port: String, machine_ip: String) {
  /**
    * Return Testsystem as Map. Simply answer in HTTPResonses
    *
    * @author Benjamin Manns
    * @return Map / JSON of User Data
    */
  def asMap(): Map[String, Any] = {
    Map(TestsystemLabels.id -> this.testsystem_id, TestsystemLabels.name -> this.name,
      TestsystemLabels.description -> this.description, TestsystemLabels.supported_formats -> supported_formats,
      TestsystemLabels.machine_ip -> TestsystemLabels.machine_ip, TestsystemLabels.machine_port -> this.machine_port)
  }

  /**
    * Print Testsystem infomation
    * @return user info string
    */
  override def toString: String = asMap().toString()
}

