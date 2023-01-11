package de.thm.ii.fbs.model.v2.checker.excel

import org.jgrapht.Graph
import org.jgrapht.graph.DefaultDirectedGraph
import org.jgrapht.graph.DefaultEdge

class ReferenceGraph(references: Map<Int, Map<String, Pair<String, Set<Cell>>>>) {
    val data: Graph<Cell, DefaultEdge> = DefaultDirectedGraph(DefaultEdge::class.java)

    init {
        references.forEach { (index, sheet) ->
            sheet.forEach { (cell, valueAndRefs) ->
                val value = valueAndRefs.first
                val refs = valueAndRefs.second
                val cellVertex = Cell(index, cell, value)
                data.addVertex(cellVertex) // inserts vertex if it not already exists
                refs.forEach { ref ->
                    data.addVertex(ref) // inserts vertex if it not already exists
                    data.addEdge(cellVertex, ref) // inserts edge if it not already exists (no multiple edges)
                }
            }
        }
    }
}