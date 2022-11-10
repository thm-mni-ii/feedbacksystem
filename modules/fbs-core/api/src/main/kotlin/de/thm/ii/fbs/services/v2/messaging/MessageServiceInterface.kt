package de.thm.ii.fbs.services.v2.messaging

import de.thm.ii.fbs.common.types.checkerApi.PollResponse

interface MessageServiceInterface {
    fun poll(id: Int): PollResponse
    fun submit(it: Int, data: PollResponse)
}
