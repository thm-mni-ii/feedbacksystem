package de.thm.ii.fbs.model.classroom.storage

/**
  * A BidirectionalStorage where Multiple M elements can be mapped to a single one but one M element can only be mapped to a single Many
  * @tparam A The type of the "one" element
  * @tparam B The type of the "many" element
  */
class OneToManyBidirectionalStorage[A, B] extends BidirectionalStorage[A, B] {
  /**
    * Creats a new BidirectionalMapping
    * @param a the "one" element
    * @param b the "many" component
    */
  override def put(a: A, b: B): Unit = this.synchronized {
    super.deleteByB(b)

    super.put(a, b)
  }

  /**
    * Gets one A by a B
    * @param b the B
    * @return the A
    */
  def getOne(b: B): Option[A] = super.getA(b).headOption

  /**
    * Gets many Bs by one A
    * @param a the A
    * @return the Bs
    */
  def getMany(a: A): Set[B] = super.getB(a)

  /**
    * Deletes one A by a B
    * @param b the B
    * @return the deleted A
    */
  def deleteOne(b: B): Option[A] = super.deleteByB(b).headOption

  /**
    * Deletes many Bs by one A
    * @param a the A
    * @return the deleted Bs
    */
  def deleteMany(a: A): Set[B] = super.deleteByA(a)
}
