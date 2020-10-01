package de.thm.ii.fbs.model.classroom.storage

import org.junit.{Assert, Test}

/**
  * Tests ObjectStorage
  */
class ObjectStorageTest {
  private case class StorageObject(id: Integer, name: String);

  /**
    * Test ObjectStorage add
    */
  @Test
  def testAdd(): Unit = {
    val storage = new ObjectStorage[StorageObject]()
    storage.add(StorageObject(0, "Test"))
    Assert.assertFalse(storage.getAll.isEmpty)
  }

  /**
    * Test ObjectStorage getWhere to ensure it returns an existing object
    */
  @Test
  def testGetWhereFindsExistingObject(): Unit = {
    val storage = new ObjectStorage[StorageObject]()
    fillWithTestData(storage)
    val objects = storage.getWhere("id", 0)
    Assert.assertFalse(objects.isEmpty)
    val obj = objects.head
    Assert.assertEquals(0, obj.id)
    Assert.assertEquals("Test", obj.name)
  }

  /**
    * Test ObjectStorage getWhere to ensure it does not return an non existing object
    */
  @Test
  def testGetWhereNonExistingObject(): Unit = {
    val storage = new ObjectStorage[StorageObject]()
    storage.add(StorageObject(0, "Test"));
    val option = storage.getWhere("id", 10)
    Assert.assertTrue(option.isEmpty)
  }

  /**
    * Test ObjectStorage getWhere to ensure it returns multiple existing object
    */
  @Test
  def testGetWhereFindsMultipleExistingObject(): Unit = {
    val storage = new ObjectStorage[StorageObject]()
    fillWithTestData(storage);
    val objects = storage.getWhere("name", "Foo")
    Assert.assertEquals(2, objects.size)
    objects.foreach(obj => Assert.assertEquals("Foo", obj.name))
  }

  /**
    * Tests ObjectStorage remove
    */
  @Test
  def testRemove(): Unit = {
    val storage = new ObjectStorage[StorageObject]()
    fillWithTestData(storage);
    storage.remove(StorageObject(6, "Bar"))
    val objects = storage.getWhere("name", "Bar")
    Assert.assertEquals(1, objects.size)
    objects.foreach(obj => Assert.assertEquals("Bar", obj.name))
  }

  /**
    * Tests ObjectStorage add with index
    */
  @Test
  def testIndexedAdd(): Unit = {
    val storage = new ObjectStorage[StorageObject]()
    storage.addIndex("name")
    fillWithTestData(storage)
    val objects = storage.getWhere("name", "Foo")
    Assert.assertEquals(2, objects.size)
    objects.foreach(obj => Assert.assertEquals("Foo", obj.name))
  }

  /**
    * Tests ObjectStorage remove with index
    */
  @Test
  def testRemoveWithIndex(): Unit = {
    val storage = new ObjectStorage[StorageObject]()
    storage.addIndex("name")
    fillWithTestData(storage);
    storage.remove(StorageObject(6, "Bar"))
    val objects = storage.getWhere("name", "Bar")
    Assert.assertEquals(1, objects.size)
    objects.foreach(obj => Assert.assertEquals("Bar", obj.name))
  }

  /**
    * Tests MultiThreaded adds
    */
  @Test
  def testMultiThread(): Unit = {
    val storage = new ObjectStorage[StorageObject]()
    storage.addIndex("id")
    val threads = (0 until 10)
      .map(num => new Thread(() => (0 until 100000)
        .foreach(id => storage.add(StorageObject(id, s"${num}-${id.toString}-name")))))
    threads.foreach(_.start())
    threads.foreach(_.join())
    (0 until 100000).foreach(id => {
      val objects = storage.getWhere("id", id)
      Assert.assertEquals(10, objects.size)
    })
  }

  private def fillWithTestData(storage: ObjectStorage[ObjectStorageTest.this.StorageObject]): Unit =
    List(StorageObject(0, "Test"), StorageObject(1, "Hello"), StorageObject(2, "World"),
      StorageObject(3, "Foo"), StorageObject(4, "Bar"), StorageObject(5, "Foo"),
      StorageObject(6, "Bar")).foreach(storage.add)
}
