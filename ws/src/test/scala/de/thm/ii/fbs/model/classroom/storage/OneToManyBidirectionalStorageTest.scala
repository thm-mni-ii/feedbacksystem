package de.thm.ii.fbs.model.classroom.storage

import org.junit.{Assert, Test}

/**
  * Tests OneToManyBidirectionalStorage
  */
class OneToManyBidirectionalStorageTest {
  /**
    * Tests OneToManyBidirectionalStorage put
    */
  @Test
  def putManyTest(): Unit = {
    val storage = new OneToManyBidirectionalStorage[Int, String]()
    storage.put(5, "hello")
    storage.put(2, "hi")
    storage.put(3, "foo")
    storage.put(3, "bar")
    val objects = storage.getAll
    Assert.assertEquals(4, objects.size)
  }

  /**
    * Tests OneToManyBidirectionalStorage put
    */
  @Test
  def putOneTest(): Unit = {
    val storage = new OneToManyBidirectionalStorage[Int, String]()
    storage.put(3, "hello")
    storage.put(5, "hello")
    val objects = storage.getAll
    Assert.assertEquals(1, objects.size)
    val obj = objects.head
    Assert.assertEquals(obj._1, 5)
    Assert.assertEquals(obj._2, "hello")
  }

  /**
    * Tests OneToManyBidirectionalStorage getOne
    */
  @Test
  def getOneTest(): Unit = {
    val storage = new OneToManyBidirectionalStorage[Int, String]()
    fillWithTestData(storage)
    val a = storage.getOne("Foo")
    Assert.assertTrue(a.isDefined)
    Assert.assertEquals(3, a.get)
  }

  /**
    * Tests OneToManyBidirectionalStorage getMany
    */
  @Test
  def getManyTest(): Unit = {
    val storage = new OneToManyBidirectionalStorage[Int, String]()
    fillWithTestData(storage)
    val b = storage.getMany(3)
    Assert.assertEquals(2, b.size)
    Assert.assertEquals(Set("Foo", "Bar"), b)
  }

  /**
    * Tests OneToManyBidirectionalStorage deleteOne
    */
  @Test
  def deleteOne(): Unit = {
    val storage = new OneToManyBidirectionalStorage[Int, String]()
    fillWithTestData(storage)
    storage.deleteOne("Foo")
    val obj = storage.getOne("Foo")
    Assert.assertTrue(obj.isEmpty)
    val objects = storage.getMany(3)
    Assert.assertEquals(1, objects.size)
  }

  /**
    * Tests OneToManyBidirectionalStorage deleteMany
    */
  @Test
  def deleteMany(): Unit = {
    val storage = new OneToManyBidirectionalStorage[Int, String]()
    fillWithTestData(storage)
    storage.deleteMany(3)
    val objects = storage.getMany(3)
    Assert.assertTrue(objects.isEmpty)
    val obj = storage.getOne("Foo")
    Assert.assertTrue(obj.isEmpty)
  }

  /**
    * Tests MultiThreaded puts
    */
  @Test
  def testMultiThread(): Unit = {
    val storage = new NonDuplicatesBidirectionalStorage[Int, String]()
    val threads = (0 until 10)
      .map(num => new Thread(() => (0 until 100000)
        .foreach(id => storage.put(id, s"${num}-${id.toString}-name"))))
    threads.foreach(_.start())
    threads.foreach(_.join())
    (0 until 100000).foreach(id => {
      val objects = storage.getB(id)
      Assert.assertEquals(1, objects.size)
    })
  }

  private def fillWithTestData(storage: BidirectionalStorage[Int, String]): Unit = {
    List((4, "Test"), (5, "Hello"), (5, "World"), (3, "Foo"), (3, "Bar"), (3, "Foo"), (3, "Bar"))
      .foreach(t => storage.put(t._1, t._2))
  }
}
