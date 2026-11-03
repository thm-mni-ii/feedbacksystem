package de.thm.ii.fbs.utils.v2.converters

import de.thm.ii.fbs.model.v2.checker.excel.Cell
import de.thm.ii.fbs.model.v2.checker.excel.ReferenceGraph
import org.junit.Assert
import org.junit.Test
import tools.jackson.databind.ObjectMapper
import tools.jackson.databind.json.JsonMapper
import tools.jackson.databind.module.SimpleModule

class ReferenceGraphSerialisationTest {
    private val objectMapper: ObjectMapper = JsonMapper.builder()
        .addModule(
            SimpleModule()
                .addSerializer(ReferenceGraph::class.java, ReferenceGraphSerializer())
                .addDeserializer(ReferenceGraph::class.java, ReferenceGraphDeserializer())
        )
        .build()

    private fun getResult(graph: ReferenceGraph): ReferenceGraph {
        val json = objectMapper.writeValueAsString(graph)
        return objectMapper.readValue(json, ReferenceGraph::class.java)
    }

    @Test
    fun emptyGraph() {
        val expected = ReferenceGraph(emptyMap())
        Assert.assertEquals(expected, getResult(expected))
    }

    @Test
    fun smallGraph() {
        val a2 = Cell(0, "A2", "1")
        val testMap = mapOf(
            0 to mapOf("a1" to Pair("0", setOf(a2)))
        )

        val expected = ReferenceGraph(testMap)
        Assert.assertEquals(expected, getResult(expected))
    }

    @Test
    fun largeGraph() {
        val a1 = Cell(0, "A1", "0")
        val a2 = Cell(0, "A2", "1")
        val a3 = Cell(0, "A3", "2")
        val testMap = mapOf(
            0 to mapOf("A1" to Pair("0", setOf()), "A2" to Pair("1", setOf(a1)), "A3" to Pair("2", setOf(a1))),
            1 to mapOf("A1" to Pair("3", setOf(a3, a2)))
        )

        val expected = ReferenceGraph(testMap)
        Assert.assertEquals(expected, getResult(expected))
    }
}
