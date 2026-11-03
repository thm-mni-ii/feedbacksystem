package de.thm.ii.fbs.utils.v2.converters

import de.thm.ii.fbs.model.v2.checker.excel.ReferenceGraph
import tools.jackson.core.JsonGenerator
import tools.jackson.databind.SerializationContext
import tools.jackson.databind.ValueSerializer

class ReferenceGraphSerializer : ValueSerializer<ReferenceGraph>() {
    override fun serialize(
        value: ReferenceGraph,
        jgen: JsonGenerator,
        provider: SerializationContext
    ) {
        ReferenceGraphSerialisation.serialize(value, jgen)
    }
}
