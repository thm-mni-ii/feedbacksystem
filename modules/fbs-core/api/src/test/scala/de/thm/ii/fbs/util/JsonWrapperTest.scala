package de.thm.ii.fbs.util

import com.fasterxml.jackson.databind.ObjectMapper
import de.thm.ii.fbs.util.JsonWrapper.jsonNodeToWrapper
import org.assertj.core.api.Assertions
import org.junit.Test
import org.junit.runner.RunWith
import org.springframework.test.context.junit4.SpringRunner

/**
  * Tests JsonWrapper
  *
  * @author Max Stephan
  */
@RunWith(classOf[SpringRunner])
class JsonWrapperTest {
  val mapper = new ObjectMapper()

  /**
    * Tests JsonWrapper As Text
    *
    */
  @Test
  def jsonWrapperTestAsText(): Unit = {
    val json = getJsonObj
    val expected = Option("test")
    val res = json.retrive("string").asText()

    Assertions.assertThat(res).isEqualTo(expected)
  }

  /**
    * Tests JsonWrapper As Int
    *
    */
  @Test
  def jsonWrapperTestAsInt(): Unit = {
    val json = getJsonObj
    val expected = Option(1)
    val res = json.retrive("int").asInt()

    Assertions.assertThat(res).isEqualTo(expected)
  }

  /**
    * Tests JsonWrapper As Bool
    *
    */
  @Test
  def jsonWrapperTestAsBool(): Unit = {
    val json = getJsonObj
    val expected = Option(true)
    val res = json.retrive("bool").asBool()

    Assertions.assertThat(res).isEqualTo(expected)
  }

  /**
    * Tests JsonWrapper As Long
    *
    */
  @Test
  def jsonWrapperTestAsLong(): Unit = {
    val json = getJsonObj
    val expected = Option(1.toLong)
    val res = json.retrive("long").asLong()

    Assertions.assertThat(res).isEqualTo(expected)
  }

  private def getJsonObj = {
    val json = mapper.createObjectNode()
    json.put("string", "test")
    json.putNull("emptyString")

    json.put("int", 1)
    json.putNull("emptyInt")

    json.put("bool", true)
    json.putNull("emptyBool")

    json.put("long", 1.toLong)
    json.putNull("emptyLong")

    json.putNull("null")
  }

  /**
    * Tests JsonWrapper with Null values
    *
    */
  @Test
  def jsonWrapperTestNull(): Unit = {
    val json = getJsonObj
    val expected = Option.empty
    val resString = json.retrive("emptyString").asText()
    val resInt = json.retrive("emptyInt").asInt()
    val resBool = json.retrive("emptyBool").asBool()
    val resLong = json.retrive("emptyLong").asLong()

    Assertions.assertThat(resString).isEqualTo(expected)
    Assertions.assertThat(resInt).isEqualTo(expected)
    Assertions.assertThat(resBool).isEqualTo(expected)
    Assertions.assertThat(resLong).isEqualTo(expected)
  }

  /**
    * Tests JsonWrapper with invalid Key
    *
    */
  @Test
  def jsonWrapperTestNotPresent(): Unit = {
    val json = getJsonObj
    val expected = Option.empty
    val resString = json.retrive("noString").asBool()
    val resInt = json.retrive("noInt").asBool()
    val resBool = json.retrive("noBool").asBool()
    val resLong = json.retrive("noLong").asBool()

    Assertions.assertThat(resString).isEqualTo(expected)
    Assertions.assertThat(resInt).isEqualTo(expected)
    Assertions.assertThat(resBool).isEqualTo(expected)
    Assertions.assertThat(resLong).isEqualTo(expected)
  }

  /**
    * Tests JsonWrapper with null
    *
    */
  @Test
  def jsonWrapperTestRetriveNull(): Unit = {
    val json = new JsonWrapper(null)

    Assertions.assertThat(json.retrive("test")).isEqualTo(json)
  }

  /**
    * Tests JsonWrapper with null
    *
    */
  @Test
  def jsonWrapperTestRetriveNullNode(): Unit = {
    val nullNode = getJsonObj.get("null")
    val json = new JsonWrapper(nullNode)

    Assertions.assertThat(json.retrive("test")).isEqualTo(json)
  }
}
