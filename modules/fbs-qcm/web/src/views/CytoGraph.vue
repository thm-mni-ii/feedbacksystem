<template>
  <div>
    <div id="cy" style="width: 100%; height: 1000px; border: 1px solid black;"></div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref, onMounted } from 'vue';
import cytoscape, { Core } from 'cytoscape';

export default defineComponent({
  name: 'CytoscapeGraph',
  setup() {
    const cy = ref<Core | null>(null); 
    const nodeId = ref(3); 

    onMounted(() => {
      cy.value = cytoscape({
        container: document.getElementById('cy'),
        elements: [
          { data: { id: 'center', label: 'Main Question: What is 2+2?' }, position: { x: 400, y: 0 }, grabbable: false},
          { data: { id: 'left', label: 'Score: 80' }, position: { x: 250, y: 0 }, grabbable: false },
          { data: { source: 'left', target: 'center', label: 'Previous Question' }},
          { data: { id: 'correct', label: '+' }, position: { x: 550, y: -60 }, grabbable: false  },
          { data: { source: 'center', target: 'correct', label: 'correct answer' }, grabbable: false },
          { data: { id: 'medium', label: '+' }, position: { x: 550, y: 0 }, grabbable: false  },
          { data: { source: 'center', target: 'medium', label: 'middle answer' }, grabbable: false },
          { data: { id: 'incorrect', label: '+' }, position: { x: 550, y: 60 }, grabbable: false  },
          { data: { source: 'center', target: 'incorrect', label: 'incorrect answer' }, grabbable: false },
        ],
        style: [
          { selector: 'node', style: { 'background-color': '#0074D9', label: 'data(label)', shape: 'rectangle', color: '#ff1f3a', 'text-valign': 'center', 'text-halign': 'center', 'border-width': '2px',
            'border-color': '#ffffff', 'width': '95px', 'height': '20px', 'font-size': '6px',} },
          { selector: 'edge', style: { 'line-color': 'black', 'target-arrow-color': 'black', 'target-arrow-shape': 'triangle', 'curve-style': 'bezier', label: 'data(label)', 'font-size': '6px',
            'width': '1px','text-margin-y': '-10px'} },
          { selector: 'node[label="+"]', style: { 'background-color': '#28a745', label: 'data(label)', 'width': '30px', 'height': '30px', 'shape': 'round-rectangle', color: 'white'} },
        ],
        layout: { name: 'preset' },
        userPanningEnabled: false,
        userZoomingEnabled: false,
      });
        cy.value.on('tap', 'node', (event) => {
            const clickedNode = event.target; // The clicked node
            if (clickedNode.data('label') === '+') {
              clickedNode.data('label', 'Question'); // Update the label to "Question"
            }
        });
    });
    const addNode = () => {
      if (cy.value) {
        const newNodeId = `question${nodeId.value}`;
        const newNodeLabel = `Question ${nodeId.value}: What is ${nodeId.value + 1} + ${nodeId.value + 1}?`;
        nodeId.value++;

        cy.value.add({ group: 'nodes', data: { id: newNodeId, label: newNodeLabel }, position: { x: 550, y: -120 + (nodeId.value *20) }, style: {grabbable: false}});
        cy.value.add({ group: 'edges', data: { source: 'center', target: newNodeId, label: '50%' }});
      }
    };

    return { addNode };
  },
});
</script>

