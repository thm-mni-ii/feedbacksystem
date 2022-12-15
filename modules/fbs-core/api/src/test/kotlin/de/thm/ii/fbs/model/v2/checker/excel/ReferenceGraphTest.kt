package de.thm.ii.fbs.model.v2.checker.excel

import org.junit.Test
import org.junit.jupiter.api.Assertions.*

class ReferenceGraphTest {

    @Test
    fun testInit() {
        val testMap = mapOf(
            1 to mapOf("A1" to setOf(), "A2" to setOf("A1"), "A3" to setOf("A1")),
            2 to mapOf("A1" to setOf("1!A3", "1!A2"))
        )
        val graph = ReferenceGraph(testMap)

        val a1 = Cell(1, "A1")
        val a2 = Cell(1, "A2")
        val a3 = Cell(1, "A3")
        val a1on2 = Cell(2, "A1")

        // assert vertices
        assertEquals(setOf(a1, a2, a3, a1on2), graph.data.vertexSet())

        // assert directed edges
        assertEquals(4, graph.data.edgeSet().size)
        assert(graph.data.containsEdge(a2, a1))
        assert(!graph.data.containsEdge(a1, a2))
        assert(graph.data.containsEdge(a3, a1))
        assert(graph.data.containsEdge(a1on2, a2))
        assert(graph.data.containsEdge(a1on2, a3))
    }
}