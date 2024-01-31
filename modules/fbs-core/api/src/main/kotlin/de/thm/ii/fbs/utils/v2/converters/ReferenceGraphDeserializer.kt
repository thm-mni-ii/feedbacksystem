package de.thm.ii.fbs.utils.v2.converters

import com.fasterxml.jackson.core.JsonParser
import com.fasterxml.jackson.databind.DeserializationContext
import com.fasterxml.jackson.databind.JsonDeserializer
import com.fasterxml.jackson.databind.JsonNode
import de.thm.ii.fbs.model.v2.checker.excel.graph.ReferenceGraph

class ReferenceGraphDeserializer : JsonDeserializer<ReferenceGraph>() {
    override fun deserialize(jp: JsonParser, ctxt: DeserializationContext?): ReferenceGraph {
        val node: JsonNode = jp.codec.readTree(jp)

        return ReferenceGraphSerialisation.deserialize(node)
    }
}
