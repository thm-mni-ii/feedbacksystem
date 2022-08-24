package de.thm.ii.fbs.model.classroom.storage

import org.junit.{Assert, Test}

class BidirectionalStorageTest {
  /**
    * Tests BidirectionalStorage put
    */
  @Test
  def putTest(): Unit = {
    val storage = new BidirectionalStorage[Int, String]()
    storage.put(0, "hello")
    val objects = storage.getAll
    Assert.assertEquals(1, objects.size)
    val obj = objects.head
    Assert.assertEquals(obj._1, 0)
    Assert.assertEquals(obj._2, "hello")
  }

  /**
    * Tests BidirectionalStorage getA
    */
  @Test
  def getATest(): Unit = {
    val storage = new BidirectionalStorage[Int, String]()
    fillWithTestData(storage)
    val as = storage.getA("Foo")
    Assert.assertEquals(2, as.size)
  }

  /**
    * Tests BidirectionalStorage getB
    */
  @Test
  def getBTest(): Unit = {
    val storage = new BidirectionalStorage[Int, String]()
    fillWithTestData(storage)
    val bs = storage.getB(0)
    Assert.assertEquals(1, bs.size)
    Assert.assertEquals("Test", bs.head)
  }

  /**
    * Tests BidirectionalStorage deleteByA
    */
  @Test
  def deleteByATest(): Unit = {
    val storage = new BidirectionalStorage[Int, String]()
    fillWithTestData(storage)
    storage.deleteByA(0)
    val objects = storage.getB(0)
    Assert.assertTrue(objects.isEmpty)
  }

  /**
    * Tests BidirectionalStorage deleteByB
    */
  @Test
  def deleteByBTest(): Unit = {
    val storage = new BidirectionalStorage[Int, String]()
    fillWithTestData(storage)
    storage.deleteByB("Bar")
    val objects = storage.getA("Bar")
    Assert.assertTrue(objects.isEmpty)
  }

  /**
    * Tests MultiThreaded puts
    */
  @Test
  def testMultiThread(): Unit = {
    val storage = new BidirectionalStorage[Int, String]()
    val threads = (0 until 10)
      .map(num => new Thread(() => (0 until 100000)
        .foreach(id => storage.put(id, s"${num}-${id.toString}-name"))))
    threads.foreach(_.start())
    threads.foreach(_.join())
    (0 until 100000).foreach(id => {
      val objects = storage.getB(id)
      Assert.assertEquals(10, objects.size)
    })
  }

  private def fillWithTestData(storage: BidirectionalStorage[Int, String]): Unit = {
    List((0, "Test"), (1, "Hello"), (2, "World"), (3, "Foo"), (4, "Bar"), (5, "Foo"), (6, "Bar"))
      .foreach(t => storage.put(t._1, t._2))
  }
}
