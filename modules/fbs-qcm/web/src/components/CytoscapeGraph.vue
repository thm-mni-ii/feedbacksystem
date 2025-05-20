<template>
  <div>
    <h2>Question Flow</h2>
    <div id="cy" style="width: 100%; height: 500px; border: 1px solid black;"></div>
    <button @click="addNode" style="margin-top: 10px;">Add Question</button>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import cytoscape, { Core } from 'cytoscape';

export default defineComponent({
  name: 'CytoscapeGraph',
  setup() {
    const cy = ref<Core | null>(null); // Reference to the Cytoscape instance
    const nodeId = ref(4); // Counter for new nodes (to generate unique IDs)

    onMounted(() => {
      // Initialize Cytoscape
      cy.value = cytoscape({
        container: document.getElementById('cy'), // Container for Cytoscape
        elements: [
          // Central fixed node (main question)
          { data: { id: 'center', label: 'Main Question: What is 2+2?' }, position: { x: 400, y: 250 } },
          
          // Optional left node (score leading to the main question)
          { data: { id: 'left', label: 'Score: 80' }, position: { x: 250, y: 250 } },
          
          // Edge from left node to center node
          { data: { source: 'left', target: 'center' } },

          // Example node to the right (Question 1)
          { data: { id: 'question1', label: 'Question 1: What is 3+3?' }, position: { x: 550, y: 250 } },
          
          // Edge from center node to question 1
          { data: { source: 'center', target: 'question1', label: 'Next Question' } },

          // Example node to the right (Question 2)
          { data: { id: 'question2', label: 'Question 2: What is 5+5?' }, position: { x: 700, y: 250 } },

          // Edge from question 1 to question 2
          { data: { source: 'question1', target: 'question2', label: 'Next Question' } },

          // Edge from center node to plus button (for UI purpose, not a real node)
          { data: { source: 'center', target: 'plus', label: 'Add Question' } },
        ],
        style: [
          {
            selector: 'node',
            style: {
              'background-color': '#0074D9',
              label: 'data(label)',
              color: '#ffffff',
              'text-valign': 'center',
              'text-halign': 'center',
              'border-width': '2px',
              'border-color': '#ffffff',
              'width': '100px',
              'height': '50px',
            },
          },
          {
            selector: 'edge',
            style: {
              'line-color': '#FF4136',
              'target-arrow-color': '#FF4136',
              'target-arrow-shape': 'triangle',
              'curve-style': 'bezier',
              'font-size': '10px',
              label: 'data(label)',
              color: '#FF4136',
            },
          },
          {
            selector: 'node#plus',
            style: {
              'background-color': '#28a745',
              label: 'data(label)',
              'width': '30px',
              'height': '30px',
              'shape': 'round-rectangle',
              'text-valign': 'center',
              'text-halign': 'center',
              color: 'white',
            },
          }
        ],
        layout: {
          name: 'preset', // Use preset to keep nodes in fixed positions
        },
        userPanningEnabled: false,
        userZoomingEnabled: false,
      });

      // Check if Cytoscape was initialized properly
      if (cy.value) {
        console.log('Cytoscape initialized:', cy.value);
      } else {
        console.error('Failed to initialize Cytoscape');
      }
    });

    // Function to add a new node (question) to the right of the central node
    const addNode = () => {
      if (cy.value) {
        console.log('Adding new node...');
        const newNodeId = `node${nodeId.value}`;
        const newNodeLabel = `Question ${nodeId.value}: What is ${nodeId.value + 1} + ${nodeId.value + 1}?`;
        nodeId.value++;

        // Add a new node to the graph
        cy.value.add({
          group: 'nodes',
          data: { id: newNodeId, label: newNodeLabel },
          position: { x: 550 + (nodeId.value * 100), y: 250 }, // Positioning the new question to the right
        });

        // Add an edge from the center node to the new node
        cy.value.add({
          group: 'edges',
          data: {
            source: 'center',
            target: newNodeId,
            label: 'Next Question',
          },
        });

        // Optionally, re-layout the graph if needed
        cy.value.layout({ name: 'preset' }).run();

        console.log('Node added:', newNodeId);
      }
    };

    return {
      addNode,
    };
  },
});
</script>

<style scoped>
/* Optional styles for the component */
button {
  padding: 10px 20px;
  background-color: #0074D9;
  color: white;
  border: none;
  cursor: pointer;
  border-radius: 4px;
}

button:hover {
  background-color: #005bb5;
}
</style>

