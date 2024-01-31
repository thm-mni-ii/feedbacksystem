package de.thm.ii.fbs.utils.v2.converters

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.module.SimpleModule
import de.thm.ii.fbs.model.v2.checker.excel.Cell
import de.thm.ii.fbs.model.v2.checker.excel.graph.ReferenceGraph
import org.junit.Assert
import org.junit.Test

class ReferenceGraphSerialisationTest {
    private val objectMapper = ObjectMapper()

    init {
        val module = SimpleModule()
        module.addSerializer(ReferenceGraph::class.java, ReferenceGraphSerializer())
        module.addDeserializer(ReferenceGraph::class.java, ReferenceGraphDeserializer())
        objectMapper.registerModule(module)
    }

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
        val a1 = Cell(0, "A1", "1")
        val a2 = Cell(0, "A2", "1")
        val testMap = mapOf(
            0 to mapOf(a1 to setOf(a2))
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
            0 to mapOf(a1 to setOf(), a2 to setOf(a1), a3 to setOf(a1)),
            1 to mapOf(a1 to setOf(a3, a2))
        )

        val expected = ReferenceGraph(testMap)
        Assert.assertEquals(expected, getResult(expected))
    }
}
