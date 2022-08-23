package de.thm.ii.fbs.model.classroom

import javax.xml.bind.annotation.XmlElement
import javax.xml.bind.annotation.XmlRootElement
import javax.xml.bind.annotation.XmlType

/**
  * Response expected from JOIN Call to BBB API. Used to parse XML to Object using JAXB
  */
@XmlRootElement(name = "response")
@XmlType(propOrder = Array("returncode", "messageKey", "message", "meetingID", "userID", "authToken", "sessionToken", "url"))
class JoinRoomBBBResponse {
  /**
    * Successfully joined?
    */
  @XmlElement var returncode: Boolean = _
  /**
    * messageKey
    */
  @XmlElement var messageKey: String = _
  /**
    * error or success message
    */
  @XmlElement var message: String = _
  /**
    * meeting ID
    */
  @XmlElement var meetingID: String = _
  /**
    * userID
    */
  @XmlElement var userID: String = _
  /**
    * authToken
    */
  @XmlElement var authToken: String = _
  /**
    * sessionToken
    */
  @XmlElement var sessionToken: String = _
  /**
    * URL a user must visit to join the conference / classroom
    */
  @XmlElement var url: String = _
}
