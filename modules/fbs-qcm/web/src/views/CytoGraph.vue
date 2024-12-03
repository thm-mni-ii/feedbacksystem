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
    const cy = ref<Core | null>(null); 
    const nodeId = ref(3); 

    onMounted(() => {
      cy.value = cytoscape({
        container: document.getElementById('cy'),
        elements: [
          { data: { id: 'center', label: 'Main Question: What is 2+2?' }, position: { x: 400, y: 0 }, grabbable: false},
          { data: { id: 'left', label: 'Score: 80' }, position: { x: 250, y: 0 }, grabbable: false },
          { data: { source: 'left', target: 'center', label: 'Previous Question' }},
          { data: { id: 'question1', label: 'Question 1: What is 3+3?' }, position: { x: 550, y: -60 }, grabbable: false },
          { data: { source: 'center', target: 'question1', label: 'Next Question' }},
          { data: { id: 'plus', label: '+' }, position: { x: 550, y: 60 }, grabbable: false  },
          { data: { source: 'center', target: 'plus', label: 'Add Question' }, grabbable: false },
        ],
        style: [
          { selector: 'node', style: { 'background-color': '#0074D9', label: 'data(label)', shape: 'rectangle', color: '#ff1f3a', 'text-valign': 'center', 'text-halign': 'center', 'border-width': '2px',
            'border-color': '#ffffff', 'width': '95px', 'height': '20px', 'font-size': '6px',} },
          { selector: 'edge', style: { 'line-color': 'black', 'target-arrow-color': 'black', 'target-arrow-shape': 'triangle', 'curve-style': 'bezier', label: 'data(label)', 'font-size': '6px',
            'width': '1px','text-margin-y': '-10px'} },
          { selector: 'node#plus', style: { 'background-color': '#28a745', label: 'data(label)', 'width': '30px', 'height': '30px', 'shape': 'round-rectangle', color: 'white'} },
        ],
        layout: { name: 'preset' },
        userPanningEnabled: false,
        userZoomingEnabled: false,
      });
        cy.value.on('tap', 'node', (event) => {
            const clickedNode = event.target;
            if (clickedNode.data('label') === '+') {
              addNode();
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

