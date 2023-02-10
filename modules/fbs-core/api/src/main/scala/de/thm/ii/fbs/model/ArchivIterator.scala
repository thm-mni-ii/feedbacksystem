package de.thm.ii.fbs.model

import org.apache.commons.compress.archivers.tar.{TarArchiveEntry, TarArchiveInputStream}

class ArchivIterator(inputStream: TarArchiveInputStream) extends Iterator[TarArchiveEntry] {
    var current: TarArchiveEntry = inputStream.getNextTarEntry

    override def hasNext(): Boolean = {
      current != null
    }

    override def next(): TarArchiveEntry = {
      val tmp = current
      current = inputStream.getNextTarEntry
      tmp
    }
}
