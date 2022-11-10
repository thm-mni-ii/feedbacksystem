package de.thm.ii.fbs.common.types.checkerApi

abstract class View {
    data class MarkdownView(val markdown: String) : View()
    data class RawTextView(val text: String) : View()
    data class TableView(val headings: List<String>, val items: List<View>) : View()
    data class GridView(val columns: Int, val element: GridElement) : View() {
        data class GridElement(val columns: Int, val content: View)
    }
}
