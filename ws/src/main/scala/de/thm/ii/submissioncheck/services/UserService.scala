package de.thm.ii.submissioncheck.services
import collection.JavaConverters._
import scala.collection.mutable.ListBuffer

class UserService {

  var id:Int = -1
  var username:String = ""
  var password:String = ""

  def getUsers = {

    // TODO load from DB

    var userList = new ListBuffer[java.util.Map[String,String]]()
    userList += Map("id" -> "1", "prename" -> "Allan", "name" -> "Karlson", "username" -> "allan", "password" -> "35435143543654", "roleid" -> "1").asJava
    userList += Map("id" -> "2", "prename" -> "Allan", "name" -> "Karlson", "username" -> "allan", "password" -> "35435143543654", "roleid" -> "1").asJava
    userList += Map("id" -> "3", "prename" -> "Allan", "name" -> "Karlson", "username" -> "allan", "password" -> "35435143543654", "roleid" -> "1").asJava

    userList.toList.asJava
  }


  def addUser(prename:String, name:String, username: String, passwordClear: String, email:String, roleId:Int = 1) =  {
    val md = java.security.MessageDigest.getInstance("SHA-1")
    val passwordCrypt = md.digest(passwordClear.getBytes("UTF-8")).map("%02x".format(_)).mkString
    println(passwordCrypt)


    // TODO send to DB and get id back
    42
  }

  def load(username:String, passowrd:String)
  {
    this.username = username
    this.password = password
  }


}
