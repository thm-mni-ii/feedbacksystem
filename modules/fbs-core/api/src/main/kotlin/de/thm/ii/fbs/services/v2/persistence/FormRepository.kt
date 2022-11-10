package de.thm.ii.fbs.services.v2.persistence

import de.thm.ii.fbs.common.types.checkerApi.Form
import org.springframework.data.jpa.repository.JpaRepository

interface FormRepository :  JpaRepository<Form, Long>
