package de.thm.ii.fbs.utils.v2.converters

import de.thm.ii.fbs.model.v2.checker.excel.ReferenceGraph
import tools.jackson.core.JsonParser
import tools.jackson.databind.DeserializationContext
import tools.jackson.databind.JsonNode
import tools.jackson.databind.ValueDeserializer

class ReferenceGraphDeserializer : ValueDeserializer<ReferenceGraph>() {
    override fun deserialize(jp: JsonParser, ctxt: DeserializationContext): ReferenceGraph {
        val node: JsonNode = ctxt.readTree(jp)

        return ReferenceGraphSerialisation.deserialize(node)
    }
}
