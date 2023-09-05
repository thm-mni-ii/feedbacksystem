package de.thm.ii.fbs.model.v2.checker.excel

import de.thm.ii.fbs.model.v2.checker.excel.graph.ReferenceGraph
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
            0 to mapOf(a1 to setOf(), a2 to setOf(a1), a3 to setOf(a1)),
            1 to mapOf(Cell(1, "A1", "0") to setOf(a3, a2))
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
            mapOf(0 to mapOf(a1 to setOf(), a2 to setOf(a1), a3 to setOf(a1)))
        val graph = ReferenceGraph(testMap)
        assert(graph.isInput(a1) && !graph.isOutput(a1))
        assert(!graph.isInput(a2) && graph.isOutput(a2))
        assert(!graph.isInput(a3) && graph.isOutput(a3))
    }

    @Test
    fun testSuccessorPredecessor() {
        val a1 = Cell(0, "A1", "0")
        val a2 = Cell(0, "A2", "1")
        val a3 = Cell(0, "A3", "2")
        val a4 = Cell(0, "A4", "3")
        val testMap =
            mapOf(
                0 to mapOf(
                    a1 to setOf(),
                    a2 to setOf(a1),
                    a3 to setOf(a1),
                    a4 to setOf(a2, a3)
                )
            )
        val graph = ReferenceGraph(testMap)

        assertEquals(graph.successors(a1), listOf<Cell>())
        assertEquals(graph.predecessors(a1), listOf(a2, a3))

        assertEquals(graph.successors(a2), listOf(a1))
        assertEquals(graph.predecessors(a2), listOf(a4))

        assertEquals(graph.successors(a3), listOf(a1))
        assertEquals(graph.predecessors(a3), listOf(a4))

        assertEquals(graph.successors(a4), listOf(a2, a3))
        assertEquals(graph.predecessors(a4), listOf<Cell>())
    }
}
