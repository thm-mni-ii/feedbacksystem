package de.thm.ii.fbs.model.v2.checker.excel

import org.jgrapht.Graph
import org.jgrapht.graph.DefaultDirectedGraph
import org.jgrapht.graph.DefaultEdge

class ReferenceGraph(references: Map<Int, Map<String, Set<String>>>) {
    val data: Graph<Cell, DefaultEdge> = DefaultDirectedGraph(DefaultEdge::class.java)

    init {
        references.forEach {
            cell -> data.addVertex() // TODO generate graph
        }
    }
}

data class Cell(val sheet: Int, val cell: String)