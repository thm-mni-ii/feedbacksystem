package de.thm.ii.fbs.utils.v2.converters

import com.fasterxml.jackson.core.JsonGenerator
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import de.thm.ii.fbs.model.v2.checker.excel.Cell
import de.thm.ii.fbs.model.v2.checker.excel.graph.ReferenceGraph
import de.thm.ii.fbs.model.v2.checker.excel.graph.ReferenceGraphEdge

object ReferenceGraphSerialisation {
    private val objectMapper = ObjectMapper()

    private const val DATA_JSON_KEY = "data"
    private const val EDGES_JSON_KEY = "edges"
    private const val VERTEXES_JSON_KEY = "vertexes"
    private const val OUTPUT_FIELDS_JSON_KEY = "outputFields"

    fun serialize(value: ReferenceGraph, jgen: JsonGenerator) {
        val vertexes = value.data.vertexSet().associateBy { v -> v.toMapKey() }
        val edges = value.data.edgeSet()
            .map { v ->
                ReferenceGraphEdge(
                    value.data.getEdgeSource(v).toMapKey(),
                    value.data.getEdgeTarget(v).toMapKey()
                )
            }
        val outputFields = value.outputFields.map { c -> c.toMapKey() }

        jgen.writeStartObject()
        jgen.writeObjectFieldStart(DATA_JSON_KEY)
        jgen.writeObjectField(VERTEXES_JSON_KEY, vertexes)
        jgen.writeObjectField(EDGES_JSON_KEY, edges)
        jgen.writeObjectField(OUTPUT_FIELDS_JSON_KEY, outputFields)
        jgen.writeEndObject()
        jgen.writeEndObject()
    }

    fun deserialize(node: JsonNode): ReferenceGraph {
        val data = node.get(DATA_JSON_KEY)
        val vertexes =
            objectMapper.readerForMapOf(Cell::class.java)
                .readValue<Map<String, Cell>>(data.get(VERTEXES_JSON_KEY))
        val edges = objectMapper.readerForListOf(ReferenceGraphEdge::class.java)
            .readValue<List<ReferenceGraphEdge>>(data.get(EDGES_JSON_KEY))
        val outputFields = objectMapper.readerForListOf(String::class.java)
            .readValue<List<String>>(data.get(OUTPUT_FIELDS_JSON_KEY))

        val graph = ReferenceGraph(emptyMap())
        vertexes.forEach { (_, v) -> graph.data.addVertex(v) }
        edges.forEach { v -> graph.data.addEdge(vertexes[v.source], vertexes[v.target]) }
        graph.outputFields = outputFields.map { c -> vertexes[c]!! }

        return graph
    }
}
