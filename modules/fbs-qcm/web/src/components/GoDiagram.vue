<template>
  <div>
    <div id="myDiagramDiv" style="width: 100%; height: 500px; border: 1px solid black;"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, onMounted } from 'vue';
import * as go from 'gojs';

export default defineComponent({
  name: 'GoDiagram',
  setup() {
    onMounted(() => {
      // Create the diagram
      const $ = go.GraphObject.make; // Simplifies diagram creation
      const diagram = $(go.Diagram, 'myDiagramDiv', {
        initialContentAlignment: go.Spot.Center, // Center the content
        'undoManager.isEnabled': true, // Enable undo/redo
      });

      // Define a simple Node template
      diagram.nodeTemplate = $(
        go.Node,
        'Auto', // Position nodes automatically
        $(go.Shape, 'RoundedRectangle', { fill: 'lightblue' }), // Node shape
        $(go.TextBlock, { margin: 5 }, new go.Binding('text', 'key')) // Display the key as text
      );

      // Define a simple Link template
      diagram.linkTemplate = $(
        go.Link,
        $(go.Shape), // Link path
        $(go.Shape, { toArrow: 'Standard' }) // Arrow at the end
      );

      // Provide initial data
      diagram.model = new go.GraphLinksModel(
        [
          { key: 'Node 1' },
          { key: 'Node 2' },
          { key: 'Node 3' },
        ],
        [
          { from: 'Node 1', to: 'Node 2' },
          { from: 'Node 2', to: 'Node 3' },
        ]
      );
    });
  },
});
</script>

<style scoped>
/* Optional styles */
</style>

