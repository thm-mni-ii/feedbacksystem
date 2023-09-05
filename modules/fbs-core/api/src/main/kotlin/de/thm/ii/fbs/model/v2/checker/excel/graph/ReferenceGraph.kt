package de.thm.ii.fbs.model.v2.checker.excel.graph

import de.thm.ii.fbs.model.v2.checker.excel.Cell
import org.jgrapht.Graph
import org.jgrapht.Graphs
import org.jgrapht.graph.DefaultDirectedGraph

class ReferenceGraph(references: Map<Int, Map<Cell, Set<Cell>>>) {
    var data: Graph<Cell, ReferenceEdge> = DefaultDirectedGraph(ReferenceEdge::class.java)
    var outputFields: List<Cell> = emptyList()

    init {
        references.forEach { (_, sheet) ->
            sheet.forEach { (cell, refs) ->
                data.addVertex(cell) // inserts vertex if it not already exists
                refs.forEach { ref ->
                    data.addVertex(ref) // inserts vertex if it not already exists
                    data.addEdge(cell, ref) // inserts edge if it not already exists (no multiple edges)
                }
            }
        }

        outputFields = data.vertexSet().filter { c -> this.isOutput(c) }
    }

    fun isInput(cell: Cell): Boolean {
        return !Graphs.vertexHasSuccessors(data, cell)
    }

    fun isOutput(cell: Cell): Boolean {
        return !Graphs.vertexHasPredecessors(data, cell)
    }

    fun successors(cell: Cell): List<Cell> {
        return Graphs.successorListOf(data, cell)
    }

    fun predecessors(cell: Cell): List<Cell> {
        return Graphs.predecessorListOf(data, cell)
    }

    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as ReferenceGraph

        return data == other.data
    }

    override fun hashCode(): Int {
        return data.hashCode()
    }
}
