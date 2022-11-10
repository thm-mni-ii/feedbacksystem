package de.thm.ii.fbs.services.v2.messaging

import de.thm.ii.fbs.common.types.checkerApi.PollResponse
import java.util.concurrent.BlockingQueue
import java.util.concurrent.LinkedBlockingQueue
import java.util.concurrent.locks.Lock
import java.util.concurrent.locks.ReentrantLock

class InMemoryMessageService : MessageServiceInterface {
    companion object InMemoryMessageService {
        val lock: Lock = ReentrantLock()
        val qm: MutableMap<Int, BlockingQueue<PollResponse>> = HashMap()

        private fun getQueue(id: Int): BlockingQueue<PollResponse> {
            lock.lock()
            try {
                if (!qm.containsKey(id)) {
                    qm[id] = LinkedBlockingQueue()
                }
                return qm[id]!!
            } finally {
                lock.unlock()
            }
        }
    }

    override fun poll(id: Int): PollResponse =
        getQueue(id).take()

    override fun submit(id: Int, data: PollResponse) {
        getQueue(id).add(data)
    }
}
