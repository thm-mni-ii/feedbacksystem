package de.thm.ii.fbs.utils.v2.converters

import com.fasterxml.jackson.core.JsonGenerator
import com.fasterxml.jackson.databind.JsonSerializer
import com.fasterxml.jackson.databind.SerializerProvider
import de.thm.ii.fbs.model.v2.checker.excel.graph.ReferenceGraph

class ReferenceGraphSerializer : JsonSerializer<ReferenceGraph>() {
    override fun serialize(
        value: ReferenceGraph,
        jgen: JsonGenerator,
        provider: SerializerProvider?
    ) {
        ReferenceGraphSerialisation.serialize(value, jgen)
    }
}
