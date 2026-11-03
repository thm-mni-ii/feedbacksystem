package de.thm.ii.fbs.utils.v2.converters

import de.thm.ii.fbs.model.v2.checker.excel.Cell
import de.thm.ii.fbs.model.v2.checker.excel.ReferenceGraph
import de.thm.ii.fbs.model.v2.checker.excel.ReferenceGraphEdge
import tools.jackson.core.JsonGenerator
import tools.jackson.databind.JsonNode
import tools.jackson.databind.ObjectMapper

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
        jgen.writeObjectPropertyStart(DATA_JSON_KEY)
        jgen.writePOJOProperty(VERTEXES_JSON_KEY, vertexes)
        jgen.writePOJOProperty(EDGES_JSON_KEY, edges)
        jgen.writePOJOProperty(OUTPUT_FIELDS_JSON_KEY, outputFields)
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
