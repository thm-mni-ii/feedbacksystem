package de.thm.ii.fbs.model.practiceroom.storage

/**
  * Allows access to a by b and b by a
  * @tparam A The type of a
  * @tparam B The type of b
  */
class BidirectionalStorage[A, B] extends ObjectStorage[(A, B)] {
  super.addIndex("_1")
  super.addIndex("_2")

  /**
    * Creats a new BidirectionalMapping
    * @param a the first component
    * @param b the second component
    */
  def put(a: A, b: B): Unit = {
    this.deleteByA(a)
    this.deleteByB(b)

    super.add((a, b))
  }

  /**
    * Gets a by b
    * @param b the given component b
    * @return the returned component a
    */
  def getA(b: B): Set[A] = super.getWhere("b", b).map(_._1)

  /**
    * Gets b by a
    * @param a the given component a
    * @return the returned component b
    */
  def getB(a: A): Set[B] = super.getWhere("a", a).map(_._2)

  /**
    * Get all as in the Mapping
    * @return all a
    */
  def getAllA: Set[A] = super.getAll.map(_._1)

  /**
    * Get all bs in the Mapping
    * @return all b
    */
  def getAllB: Set[B] = super.getAll.map(_._2)

  /**
    * Deletes by a
    * @param a the given component a
    * @return the bs of the deleted mapping or empty
    */
  def deleteByA(a: A): Set[B] = {
    val bs = this.getB(a)
    bs.foreach(b => super.remove((a, b)))
    bs
  }

  /**
    * Deletes by b
    * @param b the given component b
    * @return the as of the deleted mapping or empty
    */
  def deleteByB(b: B): Set[A] = {
    val as = this.getA(b)
    as.foreach(a => super.remove((a, b)))
    as
  }
}
