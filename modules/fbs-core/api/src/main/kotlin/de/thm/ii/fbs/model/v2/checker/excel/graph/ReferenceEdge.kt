package de.thm.ii.fbs.model.v2.checker.excel.graph

import org.jgrapht.graph.DefaultEdge
import java.util.*

class ReferenceEdge : DefaultEdge() {
    override fun equals(other: Any?): Boolean {
        if (this === other) return true
        if (javaClass != other?.javaClass) return false

        other as ReferenceEdge

        return !(source != other.source || target != other.target)
    }

    override fun hashCode(): Int {
        return Objects.hash(this.source, this.target)
    }
}
