package de.thm.ii.fbs.utils.v2.converters

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import de.thm.ii.fbs.model.v2.checker.excel.Cell
import de.thm.ii.fbs.model.v2.checker.excel.ReferenceGraph
import de.thm.ii.fbs.model.v2.checker.excel.ReferenceGraphEdge

object ReferenceGraphSerialisation {
    private val objectMapper = ObjectMapper()

    const val DATA_JSON_KEY = "data"
    const val EDGES_JSON_KEY = "edges"
    const val VERTEXES_JSON_KEY = "vertexes"

    fun serialize(value: ReferenceGraph): Pair<List<ReferenceGraphEdge>, Map<String, Cell>> {
        val edges = value.data.edgeSet()
            .map { v ->
                ReferenceGraphEdge(
                    value.data.getEdgeSource(v).toMapKey(),
                    value.data.getEdgeTarget(v).toMapKey()
                )
            }
        val vertexes = value.data.vertexSet().associateBy { v -> v.toMapKey() }

        return Pair(edges, vertexes)
    }

    fun deserialize(node: JsonNode): ReferenceGraph {
        val data = node.get(DATA_JSON_KEY)
        val vertexes =
            objectMapper.readerForMapOf(Cell::class.java)
                .readValue<Map<String, Cell>>(data.get(VERTEXES_JSON_KEY))
        val edges = objectMapper.readerForListOf(ReferenceGraphEdge::class.java)
            .readValue<List<ReferenceGraphEdge>>(data.get(EDGES_JSON_KEY))

        val graph = ReferenceGraph(emptyMap())
        vertexes.forEach { (_, v) -> graph.data.addVertex(v) }
        edges.forEach { v -> graph.data.addEdge(vertexes[v.source], vertexes[v.target]) }

        return graph
    }
}