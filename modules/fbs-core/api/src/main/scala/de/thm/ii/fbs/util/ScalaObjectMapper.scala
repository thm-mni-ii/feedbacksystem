package de.thm.ii.fbs.util

import tools.jackson.databind.SerializationFeature
import tools.jackson.databind.cfg.EnumFeature
import tools.jackson.databind.json.JsonMapper
import tools.jackson.module.scala.DefaultScalaModule

/**
  * Default scala mapper (Jackson 3 mappers are immutable and are created with a builder)
  */
object ScalaObjectMapper {
  /**
    * @return a builder with the Scala module and the default settings
    */
  def builder(): JsonMapper.Builder = JsonMapper.builderWithJackson2Defaults()
    .addModule(DefaultScalaModule)
    .disable(SerializationFeature.FAIL_ON_EMPTY_BEANS)
    .enable(EnumFeature.WRITE_ENUMS_USING_TO_STRING)

  /**
    * @return a new mapper with the default settings
    */
  def apply(): JsonMapper = builder().build()
}
