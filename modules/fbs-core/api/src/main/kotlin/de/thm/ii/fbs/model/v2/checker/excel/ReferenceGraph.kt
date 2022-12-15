package de.thm.ii.fbs.model.v2.checker.excel

import org.jgrapht.Graph
import org.jgrapht.graph.DefaultDirectedGraph
import org.jgrapht.graph.DefaultEdge

class ReferenceGraph(references: Map<Int, Map<String, Set<String>>>) {
    val data: Graph<Cell, DefaultEdge> = DefaultDirectedGraph(DefaultEdge::class.java)

    init {
        references.forEach { (index, sheet) ->
            sheet.forEach { (cell, refs) ->
                val cellVertex = Cell(index, cell)
                data.addVertex(cellVertex) // inserts vertex if it not already exists
                refs.forEach { ref ->
                    val externalReference = ref.split("!") // TODO implement delimiter for ODF
                    val refVertex = if (externalReference.size == 2) {
                        Cell(externalReference[0].toInt(), externalReference[1])
                    } else {
                        Cell(index, ref)
                    }
                    data.addVertex(refVertex) // inserts vertex if it not already exists
                    data.addEdge(cellVertex, refVertex) // inserts edge if it not already exists (no multiple edges)
                }
            }
        }
    }
}

data class Cell(val sheet: Int, val cell: String)