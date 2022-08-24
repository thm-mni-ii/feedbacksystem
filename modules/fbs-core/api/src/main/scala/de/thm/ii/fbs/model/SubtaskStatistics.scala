package de.thm.ii.fbs.model

import org.json.{JSONArray, JSONException, JSONObject}

import scala.collection.mutable.ArrayBuffer

/**
  * Represents a task in a Subtask Statistic
  *
  * @param taskID The task id
  * @param name The task name
  * @param subtasks A list of subtasks of that task
  */
case class SubtaskStatisticsTask(taskID: Int, name: String, subtasks: Seq[SubtaskStatisticsSubtask])

/**
  * Represents a subtask in a Subtask Statistic
  * @param name The name of the subtask
  * @param maxPoints The maximal archivable Points of the task
  * @param avgPoints The avengerly archived Points
  */
case class SubtaskStatisticsSubtask(name: String, maxPoints: Int, avgPoints: Float)

/**
  * The companion object for SubtaskStatisticsSubtask
  */
object SubtaskStatisticsSubtask {
  /**
    * Decodes an json array into a seqence of SubtaskStatisticsSubtask
    * @param json the json array
    * @return the seqence
    */
  def fromJSONString(json: String): Seq[SubtaskStatisticsSubtask] = {
    val res = new ArrayBuffer[SubtaskStatisticsSubtask]();
    new JSONArray(json).forEach(obj => {
      val jsonObject = obj.asInstanceOf[JSONObject]
      val subtaskStatisticsSubtask = SubtaskStatisticsSubtask(jsonObject.getString("name"),
        jsonObject.getInt("maxPoints"), jsonObject.getFloat("avgPoints"))
      res.addOne(subtaskStatisticsSubtask)
    })
    res.toSeq
  }
}
