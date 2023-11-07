package de.thm.ii.fbs.controller.v2

import de.thm.ii.fbs.model.v2.group.Group
import de.thm.ii.fbs.model.v2.group.api.GroupCreation
import de.thm.ii.fbs.model.v2.group.api.GroupJoining
import de.thm.ii.fbs.model.v2.security.User
import de.thm.ii.fbs.services.v2.persistence.GroupRepository
import de.thm.ii.fbs.utils.v2.annotations.CurrentUser
import de.thm.ii.fbs.utils.v2.exceptions.BadRequestException
import de.thm.ii.fbs.utils.v2.exceptions.ForbiddenException
import de.thm.ii.fbs.utils.v2.exceptions.NotFoundException
import org.springframework.web.bind.annotation.*
import java.util.UUID.randomUUID

@RestController
@RequestMapping(path = ["/api/v2/groups"])
class GroupController(
    private val groupRepository: GroupRepository,
) {
    @GetMapping
    @ResponseBody
    fun index(@CurrentUser currentUser: User): List<Group> = groupRepository.findAllByMembersContaining(currentUser)

    @PostMapping
    @ResponseBody
    fun createGroup(@CurrentUser currentUser: User, @RequestBody groupCreation: GroupCreation): Group = groupRepository.save(
           Group(
                    groupCreation.name,
                    groupCreation.key ?: generateKey(),
                    currentUser,
                    setOf(currentUser)
            )
    )

    @PostMapping("/join")
    @ResponseBody
    fun joinGroup(@CurrentUser currentUser: User, @RequestBody groupJoining: GroupJoining): Group {
        val group = groupRepository.findByKey(groupJoining.key) ?: throw NotFoundException()
        group.members += currentUser
        return groupRepository.save(group)
    }

    @PostMapping("/{groupId}/leave")
    @ResponseBody
    fun leaveGroup(@CurrentUser currentUser: User, @PathVariable groupId: Int): Group {
        val group = groupRepository.findById(groupId).orElse(null) ?: throw NotFoundException()
        if (!group.members.contains(currentUser)) {
            throw ForbiddenException()
        }
        if (group.creator == currentUser) {
            throw BadRequestException()
        }
        group.members -= currentUser
        return groupRepository.save(group)
    }

    @DeleteMapping("/{groupId}")
    @ResponseBody
    fun deleteGroup(@CurrentUser currentUser: User, @PathVariable groupId: Int): Unit = groupRepository.delete(
            groupRepository.findByIdAndCreator(groupId, currentUser) ?: throw NotFoundException()
    )

    private fun generateKey() = randomUUID().toString().substring(0,8)
}
