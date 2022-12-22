package de.thm.ii.fbs.model.v2.checker.excel

import org.junit.Test
import org.junit.jupiter.api.Assertions.assertEquals

class ReferenceGraphTest {

    @Test
    fun testInit() {
        val a1 = Cell(0, "A1")
        val a2 = Cell(0, "A2")
        val a3 = Cell(0, "A3")
        val a1on1 = Cell(1, "A1")
        val testMap = mapOf(
            0 to mapOf("A1" to setOf(), "A2" to setOf(a1), "A3" to setOf(a1)),
            1 to mapOf("A1" to setOf(a3, a2))
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
}
