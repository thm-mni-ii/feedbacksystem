package de.thm.ii.fbs.model.classroom.storage

import org.junit.{Assert, Test}

class NonDuplicatesBidirectionalStorageTest {
  /**
    * Tests NonDuplicatesBidirectionalStorage put
    */
  @Test
  def putTest(): Unit = {
    val storage = new NonDuplicatesBidirectionalStorage[Int, String]()
    storage.put(0, "hello")
    val objects = storage.getAll
    Assert.assertEquals(1, objects.size)
    val obj = objects.head
    Assert.assertEquals(obj._1, 0)
    Assert.assertEquals(obj._2, "hello")
  }

  /**
    * Tests NonDuplicatesBidirectionalStorage getSingleA
    */
  @Test
  def getSingleATest(): Unit = {
    val storage = new NonDuplicatesBidirectionalStorage[Int, String]()
    fillWithTestData(storage)
    val a = storage.getSingleA("Foo")
    Assert.assertTrue(a.isDefined)
    Assert.assertEquals(5, a.get)
  }

  /**
    * Tests NonDuplicatesBidirectionalStorage getB
    */
  @Test
  def getSingleBTest(): Unit = {
    val storage = new NonDuplicatesBidirectionalStorage[Int, String]()
    fillWithTestData(storage)
    val b = storage.getSingleB(0)
    Assert.assertTrue(b.isDefined)
    Assert.assertEquals("Test", b.get)
  }

  /**
    * Tests NonDuplicatesBidirectionalStorage deleteByASingleTest
    */
  @Test
  def deleteByASingleTest(): Unit = {
    val storage = new NonDuplicatesBidirectionalStorage[Int, String]()
    fillWithTestData(storage)
    storage.deleteByASingle(0)
    val objects = storage.getSingleB(0)
    Assert.assertTrue(objects.isEmpty)
  }

  /**
    * Tests NonDuplicatesBidirectionalStorage deleteBySingleBTest
    */
  @Test
  def deleteBySingleBTest(): Unit = {
    val storage = new NonDuplicatesBidirectionalStorage[Int, String]()
    fillWithTestData(storage)
    storage.deleteByBSingle("Bar")
    val objects = storage.getSingleA("Bar")
    Assert.assertTrue(objects.isEmpty)
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
    List((0, "Test"), (1, "Hello"), (2, "World"), (3, "Foo"), (4, "Bar"), (5, "Foo"), (6, "Bar"))
      .foreach(t => storage.put(t._1, t._2))
  }
}
