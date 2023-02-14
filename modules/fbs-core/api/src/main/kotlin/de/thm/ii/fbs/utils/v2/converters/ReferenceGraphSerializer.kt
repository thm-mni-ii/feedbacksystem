package de.thm.ii.fbs.utils.v2.converters

import com.fasterxml.jackson.core.JsonGenerator
import com.fasterxml.jackson.databind.JsonSerializer
import com.fasterxml.jackson.databind.SerializerProvider
import de.thm.ii.fbs.model.v2.checker.excel.ReferenceGraph


class ReferenceGraphSerializer : JsonSerializer<ReferenceGraph>() {
    override fun serialize(
        value: ReferenceGraph, jgen: JsonGenerator, provider: SerializerProvider?
    ) {
        val values = ReferenceGraphSerialisation.serialize(value)

        jgen.writeStartObject()
        jgen.writeObjectFieldStart(ReferenceGraphSerialisation.DATA_JSON_KEY)
        jgen.writeObjectField(ReferenceGraphSerialisation.VERTEXES_JSON_KEY, values.first)
        jgen.writeObjectField(ReferenceGraphSerialisation.EDGES_JSON_KEY, values.second)
        jgen.writeEndObject()
        jgen.writeEndObject()
    }
}