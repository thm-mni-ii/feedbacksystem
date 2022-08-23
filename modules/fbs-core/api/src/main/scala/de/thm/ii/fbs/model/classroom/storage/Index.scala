package de.thm.ii.fbs.model.classroom.storage

import scala.collection.mutable

/**
  * An Index of the ObjectStorage
  * @param fieldName the field to index
  * @tparam K the type of the index key
  * @tparam V the type of the index value
  */
class Index[K, V](private val fieldName: String) {
  private val index: mutable.Map[K, mutable.Set[V]] = new mutable.HashMap[K, mutable.Set[V]]()

  /**
    * Add Obj to Index
    * @param obj the obj
    * @return
    */
  def add(obj: V): Unit = {
    val key = this.getKey(obj)
    val index = this.index.getOrElse(key, new mutable.HashSet[V]())
    if (index.isEmpty) {
      this.index(key) = index
    }
    index.add(obj)
  }

  /**
    * Get Obj from Index
    * @param key the key
    * @return the obj
    */
  def get(key: K): Set[V] = this.index.getOrElse(key, Set.empty).toSet

  /**
    * Removes the Obj from the Index
    * @param obj the obj
    * @return
    */
  def remove(obj: V): Unit = {
    val key = this.getKey(obj)
    val indexSetOption = this.index.get(key)
    if (indexSetOption.isDefined) {
      val indexSet = indexSetOption.get
      indexSet.remove(obj)
      if (indexSet.isEmpty) {
        this.index.remove(key)
      }
    }
  }

  private def getKey(obj: V): K = obj.getClass.getMethod(this.fieldName).invoke(obj).asInstanceOf[K]
}
