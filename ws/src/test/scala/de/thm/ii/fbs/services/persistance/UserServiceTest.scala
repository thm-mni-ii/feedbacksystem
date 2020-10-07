package de.thm.ii.fbs.services.persistance

import de.thm.ii.fbs.model.{GlobalRole, User}
import org.junit.Test
import org.assertj.core.api.Assertions
import org.junit.runner.RunWith
import org.springframework.test.context.junit4.SpringRunner

/**
  * Tests UserService
  *
  * @author Claude Stephane M. Kouame
  */
@RunWith(classOf[SpringRunner])
class UserServiceTest {
  /**
    * UserService object
    */
  private val us = new UserService()

  /**
    * DummyUser
    */
  private val dummyUS = new User("user", "dummy", "dummy@mni.thm.de", "dum20", GlobalRole.USER, None, 202020)
  us.create(dummyUS, "dummyUS_2020")

  /**
    * createTest
    */
  @Test
  def createTest(): Unit = {
    val user1 = us.create(new User("user1", "user1user1", "user2020@mni.thm.de", "user11", GlobalRole.USER, None, 20201), "password_user1")
    Assertions.assertThat(user1).isEqualTo(us.find(20201))
  }

  /**
    * getAllTest
    */
  @Test
  def testGetAll(): Unit = {
    Assertions.assertThat(us.getAll(false)).isNotEqualTo(us.getAll())
  }

  /**
    * findByIdTest01
    */
  @Test
  def findByIDTest01(): Unit = {
    Assertions.assertThat(us.find(202020)).isEqualTo(dummyUS)
  }

  /**
    * findByIdtest02
    */
  @Test
  def findByIDTest02(): Unit = {
    Assertions.assertThat(us.find(20201)).isNotEqualTo(dummyUS)
  }

  /**
    * findByNameTest01
    */
  @Test
  def findByNameTest01(): Unit = {
    Assertions.assertThat(us.find("dum20")).isEqualTo(dummyUS)
  }

  /**
    * findByNameTest02
    */
  @Test
  def findByNameTest02(): Unit = {
    Assertions.assertThat(us.find("user11")).isNotEqualTo(dummyUS)
  }

  /**
    * findByNameAndPassTest01
    */
  @Test
  def findByNameAndPassTest01(): Unit = {
    Assertions.assertThat(us.find("dum20", "dummyUS_2020")).isEqualTo(dummyUS)
  }

  /**
    * findByNameAndPassTest02
    */
  @Test
  def findByNameAndPassTest02(): Unit = {
    Assertions.assertThat(us.find("user11", "password_user1")).isNotEqualTo(dummyUS)
  }

  /**
    * updatePasswordFortest
    */
  @Test
  def updatePasswordForTest(): Unit = {
    us.updatePasswordFor(202020, "dummyUS_2021")
    Assertions.assertThat(us.find("dum20", "dummyUS_2021")).isEqualTo(dummyUS)

  }

  /**
    * updateGlobalRoleForTest01
    */
  @Test
  def updateGlobalRoleForTest01(): Unit = {
    us.updateGlobalRoleFor(202020, GlobalRole.MODERATOR)
    Assertions.assertThat(GlobalRole.MODERATOR.toString).isEqualTo(dummyUS.globalRole.toString)
  }

  /**
    * updateGlobalRoleForTest02
    */
  @Test
  def updateGlobalRoleForTest02(): Unit = {
    Assertions.assertThat(GlobalRole.ADMIN.toString).isNotEqualTo(dummyUS.globalRole.toString)
  }

  /**
    * updateAgreementToPrivacyForTest
    */
  @Test
  def updateAgreementToPrivacyForTest(): Unit = {
    // TODO
  }

  /**
    * getPrivacyStatusOfTest
    */
  @Test
  def testGetPrivacyStatusOf(): Unit = {
    // TODO
  }

  /**
    * deleteTest01
    */
  @Test
  def deleteTest01(): Unit = {
    Assertions.assertThat(us.delete(202020)).isEqualTo(true)
    Assertions.assertThat(us.find(202020)).isNull()
  }

  /**
    * deleteTest02
    */
  @Test
  def deleteTest02(): Unit = {
    Assertions.assertThat(us.delete(20201)).isEqualTo(true)
    Assertions.assertThat(us.find(20201)).isNull()
  }

}

