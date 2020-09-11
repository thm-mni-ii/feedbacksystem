package de.thm.ii.fbs.model.practiceroom.storage

/**
  * A Bidirectional Storage which does not allow duplicate a or bs
  * @tparam A The type of a
  * @tparam B The type of b
  */
class NonDuplicatesBidirectionalStorage[A, B] extends BidirectionalStorage[A, B] {
  /**
    * Creats a new BidirectionalMapping
    * @param a the first component
    * @param b the second component
    */
  override def put(a: A, b: B): Unit = {
    super.deleteByA(a)
    super.deleteByB(b)

    super.put(a, b)
  }

  /**
    * Gets a single a
    * @param b the b to get the a by
    * @return the a
    */
  def getSingleA(b: B): Option[A] = super.getA(b).headOption
  /**
    * Gets a single b
    * @param a the a to get the b by
    * @return the b
    */
  def getSingleB(a: A): Option[B] = super.getB(a).headOption

  /**
    * Deletes by a
    * @param a the given component a
    * @return the b of the deleted mapping or empty
    */
  def deleteByASingle(a: A): Option[B] = super.deleteByA(a).headOption

  /**
    * Deletes by b
    * @param b the given component b
    * @return the as of the deleted mapping or empty
    */
  def deleteByBSingle(b: B): Option[A] = super.deleteByB(b).headOption
}
