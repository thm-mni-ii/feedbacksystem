<template>
  <div>
    <div id="cy" style="width: 100%; height: 1000px; border: 1px solid black;"></div>
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <h3>Frage anfügen</h3>
        <p>Ab wie viel Prozent soll weitergeleitet werden</p>
        <input
          type="number"
          min="0"
          max="100"
          v-model="nodeData"
          placeholder="Update node data"
        />
        <p>Auf welche Frage soll verwiesen werden</p>
        <button @click="updateNode">Update Node</button>
        <button @click="closeModal">Close</button>
      </div>
    </div>
  </div>
</template>
<style scoped>
/* Modal Overlay */
.modal-overlay {
  position: fixed;  /* Position fixed to cover the whole screen */
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);  /* Solid white background with slight transparency */
  display: flex;
  justify-content: center;  /* Horizontally center the modal */
  align-items: center;  /* Vertically center the modal */
  z-index: 1000;  /* Ensure the modal is above the graph */
}
/* Modal Content */
.modal-content {
  background: white;  /* White background for the modal */
  padding: 20px;
  border-radius: 8px;
  width: 400px;  /* Set a fixed width */
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);  /* Subtle shadow */
  z-index: 1001;  /* Ensure it's above the overlay */
}

.modal-content h3 {
  margin-top: 0;
}

/* Input and Buttons Styling */
.modal-input {
  width: 100%;
  padding: 10px;
  margin-top: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.modal-button {
  padding: 10px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.modal-button.confirm {
  background-color: #28a745;
  color: white;
}

.modal-button.cancel {
  background-color: #dc3545;
  color: white;
}
</style>
<script lang="ts">
import { useRoute } from 'vue-router';
import { defineComponent, ref, onMounted } from 'vue';
import catalogService from '@/services/catalog.service'
import cytoscape, { Core } from 'cytoscape';
export default defineComponent({
  name: 'CytoscapeGraph',
  setup() {
    const cy = ref<Core | null>(null); 
    const nodeId = ref(3); 
    const showModal = ref(false); 
    const route = useRoute();
    const id = route.params;
    onMounted(async () => {
      console.log('ID from query parameter:', id.catalog);
      console.log('ID from query parameter:', id.question);
      console.log(route);
      const data = await catalogService.editCatalog(id.catalog, id.question);
      console.log(data);
      console.log(data.data);
      const keys = Object.keys(data.data.children).filter(key => key !== "PARTIAL").map(Number);
      let maxKey = "+";
      let minKey = "+";
      let maxId = null;
      let minId = null;
      let maxKeyNumber = "correct";
      let minKeyNumber = "incorrect";
      if (keys.length > 0) {        // Find the highest and lowest keys if there are valid keys
          maxKey = Math.max(...keys);
          minKey = Math.min(...keys);
          maxKeyNumber = `${maxKey}%`;
          minKeyNumber = `${minKey}%`;
          maxId = data.data.children[maxKey].questionId;
          maxKey = data.data.children[maxKey].text;
          minId = data.data.children[minKey].questionId;
          minKey = data.data.children[minKey].text;
      }
      console.log("A");
      console.log(maxKey);
      console.log(maxId);
      console.log(minKey);
      console.log(minId);
      console.log("A");
      cy.value = cytoscape({
        container: document.getElementById('cy'),
        elements: [
          { data: { id: 'center', label: data.data.questionText }, position: { x: 400, y: 0 }, grabbable: false},
          { data: { id: 'left', label: 'Score: 80' }, position: { x: 250, y: 0 }, grabbable: false },
          { data: { source: 'left', target: 'center', label: 'Previous Question' }},
          { data: { id: 'correct', label: maxKey, hiddenData: maxId }, position: { x: 550, y: -60 }, grabbable: false  },
          { data: { source: 'center', target: 'correct', label: maxKeyNumber }, grabbable: false },
          { data: { id: 'medium', label: '+' }, position: { x: 550, y: 0 }, grabbable: false  },
          { data: { source: 'center', target: 'medium', label: 'middle answer' }, grabbable: false },
          { data: { id: 'incorrect', label: minKey, hiddenData: minId }, position: { x: 550, y: 60 }, grabbable: false  },
          { data: { source: 'center', target: 'incorrect', label: minKeyNumber }, grabbable: false },
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
              console.log(showModal);
              showModal.value = true;
              clickedNode.data('label', 'Question'); // Update the label to "Question"
            }
            if(clickedNode.data('hiddenData') !== null) {
            console.log(id.catalog); // Ensure id.catalog is accessible
            console.log(clickedNode.data);
            console.log(clickedNode.data('hiddenData')); // Ensure hiddenData is available on clickedNode
            console.log(`http://localhost:8085/editCatalog/${id.catalog}/${clickedNode.data('hiddenData')}`);

             //window.location.href = `http://localhost:8085/editCatalog/${id.catalog}/${clickedNode.hiddenData}`
             window.location.href =`http://localhost:8085/editCatalog/${id.catalog}/${clickedNode.data('hiddenData')}`;
             console.log("");
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

    return { addNode, showModal, id} ;
  },
});
</script>

