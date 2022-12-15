package de.thm.ii.fbs.model.v2.checker.excel

import org.apache.poi.xssf.usermodel.XSSFCell
import org.jgrapht.Graph
import org.jgrapht.graph.DefaultDirectedGraph
import org.jgrapht.graph.DefaultEdge

class ReferenceGraph(references: Map<String, Map<String, Set<String>>>) {
    val data: Graph<XSSFCell, DefaultEdge> = DefaultDirectedGraph(DefaultEdge::class.java)

    init {
        references.forEach {
            cell -> data.addVertex() // TODO generate graph
        }
    }
}