
<template>
  <div>
    <h2>Question Flow</h2>
    <div id="cy" style="width: 100%; height: 500px; border: 1px solid black;"></div>
    <div style="margin-top: 10px; display: flex; flex-direction: column; position: absolute; right: 20px; top: 20px;">
      <button v-if="!buttonReplaced[0]" @click="replaceWithNode(0)" style="margin-bottom: 10px;">Add Question 1</button>
      <button v-if="!buttonReplaced[1]" @click="replaceWithNode(1)" style="margin-bottom: 10px;">Add Question 2</button>
      <button v-if="!buttonReplaced[2]" @click="replaceWithNode(2)" style="margin-bottom: 10px;">Add Question 3</button>
    </div>
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
    const buttonReplaced = ref([false, false, false]); // Track which buttons have been replaced

    onMounted(() => {
      cy.value = cytoscape({
        container: document.getElementById('cy'),
        elements: [
          { data: { id: 'center', label: 'Main Question: What is 2+2?' }, position: { x: 400, y: 0 }, grabbable: false },
          { data: { id: 'left', label: 'Score: 80' }, position: { x: 250, y: 0 }, grabbable: false },
          { data: { source: 'left', target: 'center', label: 'Previous Question' }},
          { data: { id: 'question1', label: 'Question 1: What is 3+3?' }, position: { x: 400, y: 150 } },
        ],
        style: [
          { selector: 'node', style: { 'background-color': '#0074D9', 'label': 'data(label)' } },
          { selector: 'edge', style: { 'width': 2, 'line-color': '#0074D9', 'target-arrow-shape': 'triangle', 'target-arrow-color': '#0074D9' } },
        ],
        layout: { name: 'preset' },
      });
    });

    const replaceWithNode = (buttonIndex: number) => {
      if (!cy.value) return;
      
      const newNodeId = `question${nodeId.value}`;
      cy.value.add({
        data: { id: newNodeId, label: `Question ${nodeId.value}: New Question` },
        position: { x: 400, y: 200 + nodeId.value * 50 },
      });
      nodeId.value += 1;
      buttonReplaced.value[buttonIndex] = true; // Mark button as replaced
    };

    return { replaceWithNode, buttonReplaced };
  },
});
</script>

<style scoped>
/* Add any required styling */
</style>
