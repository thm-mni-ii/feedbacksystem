package de.thm.ii.fbs.common.types.utils

import com.fasterxml.jackson.databind.ObjectMapper
import jakarta.persistence.AttributeConverter
import kotlin.reflect.KClass

abstract class JpaJsonConverter<T: Any>(kClass: KClass<T>) : AttributeConverter<T, String> {
    private val jClass = kClass.java
    private val mapper = ObjectMapper()

    override fun convertToDatabaseColumn(attribute: T?): String =
        mapper.writeValueAsString(attribute);

    override fun convertToEntityAttribute(dbData: String?): T =
        mapper.readValue(dbData, jClass)
}
