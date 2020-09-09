package de.thm.ii.fbs.model.practiceroom.storage

import java.util.concurrent.locks.{ReadWriteLock, ReentrantReadWriteLock}

import scala.collection.mutable

/**
  * A generic, thread-safe in memory object store
  *
  * @tparam T the type of the object to store
  */
class ObjectStorage[T] {
  private val objects: mutable.Set[T] = new mutable.HashSet[T]()
  private val indexes: mutable.Map[String, Index[Any, T]] = new mutable.HashMap()
  private val lock: ReadWriteLock = new ReentrantReadWriteLock()

  /**
    * Adds an object to the store
    * @param obj the object to add
    */
  def add(obj: T): Unit = {
    lock.writeLock().lock()
    if (!this.objects.contains(obj)) {
      this.indexes.values.foreach(index => index.add(obj))
      this.objects += obj
    }
    lock.writeLock().unlock()
  }

  /**
    * Gets the first value where
    * @param fieldName the field of the object
    * @param value the value the field should have
    * @return the found object
    */
  def getWhere(fieldName: String, value: Any): Option[T] = {
    lock.readLock().lock()
    var result: Option[T] = null
    val index = this.indexes.get(fieldName)
    if (index.isDefined) {
      result = index.get.get(value)
    } else {
      result = objects.find(obj => obj.getClass.getMethod(fieldName).invoke(obj).equals(value))
    }
    lock.readLock().unlock()
    result
  }

  /**
    * Gets all object in the storage
    * @return a set containing all objects in the storage
    */
  def getAll: Set[T] = this.objects.toSet

  /**
    * Removes an Object from Storage
    * @param obj the object to remove
    */
  def remove(obj: T): Unit = {
    lock.writeLock().lock()
    this.objects.remove(obj)
    this.indexes.values.foreach(index => index.remove(obj))
    lock.writeLock().unlock()
  }

  private class Index[K, V](private val fieldName: String,
                            private val index: mutable.Map[K, V] = new mutable.HashMap[K, V]()) {
    /**
      * Add Obj to Index
      * @param obj the obj
      * @return
      */
    def add(obj: V): Unit = this.index(obj.getClass.getMethod(this.fieldName).invoke(obj).asInstanceOf[K]) = obj

    /**
      * Get Obj from Index
      * @param key the key
      * @return the obj
      */
    def get(key: K): Option[V] = this.index.get(key)

    /**
      * Removes the Obj from the Index
      * @param obj the obj
      * @return
      */
    def remove(obj: V): Unit = this.index.remove(obj.getClass.getMethod(this.fieldName).invoke(obj).asInstanceOf[K])
  }

  /**
    * Adds an index
    * @param fieldName the field to index (must be unique)
    */
  def addIndex(fieldName: String): Unit = {
    lock.writeLock().lock()
    val newIndex = new Index[Any, T](fieldName)
    this.objects.foreach(obj => newIndex.add(obj))
    this.indexes(fieldName) = newIndex
    lock.writeLock().unlock()
  }
}
