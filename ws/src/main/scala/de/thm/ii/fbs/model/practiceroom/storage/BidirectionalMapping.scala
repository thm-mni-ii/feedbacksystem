package de.thm.ii.fbs.model.practiceroom.storage

/**
  * A Mapping inside the BidirectionalStorage
  * @param a The first component
  * @param b The second component
  * @tparam A The type of the first component
  * @tparam B The type of the second component
  */
case class BidirectionalMapping[A, B](a: A, b: B)
