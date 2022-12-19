package de.thm.ii.fbs.util

import io.vertx.scala.ext.sql.ResultSet

class ResultSetIterator(resultSet: ResultSet) extends Iterator[ResultSet] {
  var current: ResultSet = resultSet

  override def hasNext(): Boolean = {
    current != null
  }

  override def next(): ResultSet = {
    val last = current

    // Check if getNext from java object is null as the Scala object always returns a ResultSet (Even none should be there)
    if (current.asJava.getNext != null) {
      current = current.getNext
    } else {
      current = null
    }

    last
  }
}
