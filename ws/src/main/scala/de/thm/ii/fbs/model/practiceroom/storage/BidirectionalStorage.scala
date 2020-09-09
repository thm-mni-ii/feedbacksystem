package de.thm.ii.fbs.model.practiceroom.storage

/**
  * Allows access to a by b and b by a
  * @tparam A The type of a
  * @tparam B The type of b
  */
  class BidirectionalStorage[A, B] extends ObjectStorage[BidirectionalMapping[A, B]] {
  super.addIndex("a")
  super.addIndex("b")

  /**
    * Creats a new BidirectionalMapping
    * @param a the first component
    * @param b the second component
    */
  def put(a: A, b: B): Unit = {
    this.deleteByA(a)
    this.deleteByB(b)

    super.add(BidirectionalMapping(a, b))
  }

  /**
    * Gets a by b
    * @param b the given component b
    * @return the returned component a
    */
  def getA(b: B): Option[A] = super.getWhere("b", b).map(_.a)

  /**
    * Gets b by a
    * @param a the given component a
    * @return the returned component b
    */
  def getB(a: A): Option[B] = super.getWhere("a", a).map(_.b)

  /**
    * Get all as in the Mapping
    * @return all a
    */
  def getAllA: Set[A] = super.getAll.map(_.a)

  /**
    * Get all bs in the Mapping
    * @return all b
    */
  def getAllB: Set[B] = super.getAll.map(_.b)


  /**
    * Deletes by a
    * @param a the given component a
    * @return the b of the deleted mapping or empty
    */
  def deleteByA(a: A): Option[B] = {
    val b = this.getB(a)
    if (b.isDefined) {
      super.remove(BidirectionalMapping(a, b.get))
    }
    b
  }

  /**
    * Deletes by b
    * @param b the given component b
    * @return the a of the deleted mapping or empty
    */
  def deleteByB(b: B): Option[A] = {
    val a = this.getA(b)
    if (a.isDefined) {
      super.remove(BidirectionalMapping(a.get, b))
    }
    a
  }
}
