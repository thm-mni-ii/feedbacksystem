<template>
  <div id="myDiagramDiv" style="width: 100%; height: 600px; border: 1px solid black"></div>
</template>

<script setup lang="ts">
import * as go from 'gojs'
import { onMounted } from 'vue'

onMounted(() => {
  const $ = go.GraphObject.make

  // Erstelle das Diagramm
  const diagram = $(go.Diagram, 'myDiagramDiv', {
    layout: $(go.GridLayout, { wrappingWidth: Infinity, alignment: go.GridLayout.Position }),
    'undoManager.isEnabled': true
  })

  // Swimlane (Band) Definition
  diagram.groupTemplate = $(
    go.Group,
    'Vertical',
    {
      layout: $(go.GridLayout, { wrappingWidth: Infinity, alignment: go.GridLayout.Position }),
      background: 'transparent'
    },
    $(go.TextBlock, { font: 'Bold 14pt Sans-Serif', margin: 10 }, new go.Binding('text', 'key')),
    $(go.Panel, 'Auto', $(go.Shape, 'Rectangle', { fill: 'lightgray', stroke: null }))
  )

  // Knoten Template (Fragen)
  diagram.nodeTemplate = $(
    go.Node,
    'Auto',
    $(go.Shape, 'Rectangle', {
      fill: 'white',
      stroke: 'black',
      strokeWidth: 1
    }),
    $(go.TextBlock, { margin: 5, font: '12pt sans-serif' }, new go.Binding('text', 'text'))
  )

  // Link Template
  diagram.linkTemplate = $(
    go.Link,
    { routing: go.Link.Orthogonal, corner: 5 },
    $(go.Shape, { strokeWidth: 2, stroke: '#555' }),
    $(go.Shape, { toArrow: 'OpenTriangle', stroke: '#555' })
  )

  // Daten für Swimlanes und Fragen
  diagram.model = new go.GraphLinksModel(
    [
      // Swimlanes
      { key: 'Step 1', isGroup: true },
      { key: 'Step 2', isGroup: true },
      { key: 'Step 3', isGroup: true },

      // Fragen (Nodes)
      { key: 'Q1', text: 'Question 1', group: 'Step 1' },
      { key: 'Q2', text: 'Question 2', group: 'Step 2' },
      { key: 'Q3', text: 'Question 3', group: 'Step 2' },
      { key: 'Q4', text: 'Question 4', group: 'Step 3' },
      { key: 'Q5', text: 'Question 5', group: 'Step 3' },
      { key: 'Q6', text: 'Question 6', group: 'Step 3' }
    ],
    [
      // Links zwischen Knoten
      { from: 'Q1', to: 'Q2' },
      { from: 'Q2', to: 'Q3' },
      { from: 'Q3', to: 'Q4' },
      { from: 'Q4', to: 'Q5' },
      { from: 'Q5', to: 'Q6' }
    ]
  )
})
</script>

<style scoped>
#myDiagramDiv {
  background-color: #f7f7f7;
}
</style>
