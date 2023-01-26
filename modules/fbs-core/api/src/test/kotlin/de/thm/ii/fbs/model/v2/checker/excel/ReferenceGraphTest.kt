package de.thm.ii.fbs.model.v2.checker.excel

import org.junit.Test
import org.junit.jupiter.api.Assertions.assertEquals

class ReferenceGraphTest {

    @Test
    fun testInit() {
        val a1 = Cell(0, "A1", "0")
        val a2 = Cell(0, "A2", "1")
        val a3 = Cell(0, "A3", "2")
        val a1on1 = Cell(1, "A1", "3")
        val testMap = mapOf(
                0 to mapOf("A1" to Pair("0", setOf()), "A2" to Pair("1", setOf(a1)), "A3" to Pair("2", setOf(a1))),
                1 to mapOf("A1" to Pair("3", setOf(a3, a2)))
        )
        val graph = ReferenceGraph(testMap)

        // assert vertices
        assertEquals(setOf(a1, a2, a3, a1on1), graph.data.vertexSet())

        // assert directed edges
        assertEquals(4, graph.data.edgeSet().size)
        assert(graph.data.containsEdge(a2, a1))
        assert(!graph.data.containsEdge(a1, a2))
        assert(graph.data.containsEdge(a3, a1))
        assert(graph.data.containsEdge(a1on1, a2))
        assert(graph.data.containsEdge(a1on1, a3))
    }

    @Test
    fun testInputOutput() {
        val a1 = Cell(0, "A1", "0")
        val a2 = Cell(0, "A2", "1")
        val a3 = Cell(0, "A3", "2")
        val testMap =
            mapOf(0 to mapOf("A1" to Pair("0", setOf()), "A2" to Pair("1", setOf(a1)), "A3" to Pair("2", setOf(a1))))
        val graph = ReferenceGraph(testMap)
        assert(graph.isInput(a1) && !graph.isOutput(a1))
        assert(!graph.isInput(a2) && graph.isOutput(a2))
        assert(!graph.isInput(a3) && graph.isOutput(a3))

    }
}
