//fix on refresh, remove option for partial
<template>
  <div>
    <div id="cy" style="width: 100%; height: 1000px;"></div>
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
        <select v-model="selectedQuestion" class="question-select">
      <option v-for="question in questionOptions" :key="question._id" :value="question._id">
        {{ question.questiontext }}
      </option>
    </select>
        <button @click="addQuestion(nodeData, selectedQuestion, transition);">Update Node</button>
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
import catalogService from '@/services/catalog.service';
import questionService from '@/services/question.service';
import cytoscape, { Core } from 'cytoscape';
export default defineComponent({
  name: 'CytoscapeGraph',
  setup() {
    const cy = ref<Core | null>(null); 
    const nodeId = ref(3); 
    const showModal = ref(false); 
    const route = useRoute();
    const id = route.params;
    let currentQuestion = null;
    let currentCatalog = null;
    let questionOptions = ref([]);
    let transition = ref("");
    onMounted(async () => {
      console.log('ID from query parameter:', id.catalog);
      console.log('ID from query parameter:', id.question);
      console.log(route);
      const data = await catalogService.editCatalog(id.catalog, id.question);
      currentQuestion = id.question;
      currentCatalog = id.catalog;
      console.log(data);
      console.log(data.data);
      const keys = Object.keys(data.data.children).filter(key => key !== "PARTIAL").map(Number);
      console.log(keys);
      let maxKey = "+";
      let midKey = "+";
      let minKey = "+";
      let maxId = null;
      let midId = null;
      let minId = null;
      let maxKeyNumber = "correct";
      let midKeyNumber = "medium";
      let minKeyNumber = "incorrect";
      for(let i = 0; i < data.data.children.length; i++) {
        if(data.data.children[i].transition === "correct") {
            maxKey = data.data.children[i].text;
            maxId = data.data.children[i].questionId;
            maxKeyNumber = `${data.data.children[i].score}%`;
        }
        if(data.data.children[i].transition === "incorrect") {
            minKey = data.data.children[i].text;
            minId = data.data.children[i].questionId;
            minKeyNumber = `${data.data.children[i].score}%`;
        }
        if(data.data.children[i].transition === "partial") {
            midKey = data.data.children[i].text;
            midId = data.data.children[i].questionId;
            midKeyNumber = `${data.data.children[i].score}%`;
        }
      }
      console.log("A");
      console.log(maxKey);
      console.log(maxId);
      console.log(minKey);
      console.log(minId);
      console.log("A");
      const prevData = await catalogService.getPreviousQuestion(id.catalog, id.question);
      let prevText = "No Previous Question"
      let prevId = null;
      if(prevData.data.questionInCatalogId !== null) {
        prevText = prevData.data.text;
        prevId = prevData.data.questionInCatalogId;
      }
      console.log(prevData);
      cy.value = cytoscape({
        container: document.getElementById('cy'),
        elements: [
          { data: { id: 'center', label: data.data.questionText }, position: { x: 400, y: 0 }, grabbable: false},
          { data: { id: 'left', label: prevText, hiddenData: prevId }, position: { x: 250, y: 0 }, grabbable: false },
          { data: { source: 'left', target: 'center', label: 'Previous Question' }},
          { data: { id: 'correct', label: maxKey, hiddenData: maxId }, position: { x: 550, y: -60 }, grabbable: false  },
          { data: { source: 'center', target: 'correct', label: maxKeyNumber }, grabbable: false },
          { data: { id: 'partial', label: '+' }, position: { x: 550, y: 0 }, grabbable: false  },
          { data: { source: 'center', target: 'partial', label: 'middle answer' }, grabbable: false },
          { data: { id: 'incorrect', label: minKey, hiddenData: minId }, position: { x: 550, y: 60 }, grabbable: false  },
          { data: { source: 'center', target: 'incorrect', label: minKeyNumber }, grabbable: false },
          { data: { id: 'invisible', label: '', hidden: true }, position: { x: 550, y: 30 }, grabbable: false }
        ],
        style: [
          { selector: 'node', style: { 'background-color': '#0074D9', label: 'data(label)', shape: 'rectangle', color: '#ff1f3a', 'text-valign': 'center', 'text-halign': 'center', 'border-width': '2px',
            'border-color': '#ffffff', 'width': '95px', 'height': '20px', 'font-size': '6px',} },
          { selector: 'edge', style: { 'line-color': 'black', 'target-arrow-color': 'black', 'target-arrow-shape': 'triangle', 'curve-style': 'bezier', label: 'data(label)', 'font-size': '6px',
            'width': '1px','text-margin-y': '-10px'} },
          { selector: 'node[label="+"]', style: { 'background-color': '#28a745', label: 'data(label)', 'width': '30px', 'height': '30px', 'shape': 'round-rectangle', color: 'white'} },
          { selector: 'node[hidden]', style: { 'visibility': 'hidden' } }
        ],
        layout: { name: 'preset' },
        userPanningEnabled: false,
        userZoomingEnabled: false,
      });
        cy.value.on('tap', 'node', async (event) => {
            const clickedNode = event.target; 
            console.log(clickedNode.data('label'));
            console.log(clickedNode.data('hiddenData'));
            console.log(clickedNode.id());
            if (clickedNode.data('label') === '+') {
              attachButtonToNode(clickedNode.id());
              const data = await questionService.getAllQuestions();
              console.log(data);
              console.log(showModal);
              updateQuestionOptions(data.data);
              transition.value = clickedNode.id(); 
              showModal.value = true;
              clickedNode.data('label', 'Question'); 
             } else if(clickedNode.data('hiddenData') !== null && clickedNode.data('hiddenData') !== undefined) {
                console.log(id.catalog); 
                console.log(clickedNode.data);
                console.log(clickedNode.data('hiddenData')); 
                console.log(`http://localhost:8085/editCatalog/${id.catalog}/${clickedNode.data('hiddenData')}`);
                window.location.href =`http://localhost:8085/editCatalog/${id.catalog}/${clickedNode.data('hiddenData')}`;
            }
        });
        cy.value.nodes().forEach((node) => {
            attachButtonToExistingNode(node.id());  
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
    const updateQuestionOptions = (data) => {
      console.log(data);
      questionOptions.value = data;
      console.log(questionOptions);
    };
    const closeModal = () => {
        showModal.value = false;
        questionOptions.value = [];
    }
    const addQuestion = async (score, questionId, transition) => {
        console.log(score);
        console.log(questionId);
        const res = await questionService.addQuestionToCatalog(questionId, currentCatalog);  
        console.log(res);
        const question = route.params.question;
        console.log(question);
        const res2 = await catalogService.addChildrenToQuestion(question, res.data.insertedId, score, transition);
    }
    const attachButtonToNode = (nodeId) => {
      if(nodeId === "invisible") {
        return;
      }
      const node = cy.value.$id(nodeId);
      const position = node.renderedPosition();
      const button = document.createElement('button');
      button.innerText = 'x';
      button.className = 'remove-button';
      button.style.position = 'absolute';
      button.style.width = '70px';   // Set the button width
      button.style.height = '70px';  // Set the button height
      button.style.color = 'red';   // Set the text color to white
      const left = position.x - 300;
      const top = position.y;
      button.style.fontSize = '50px';  // Adjust font size to make "x" bigger
      button.style.fontWeight = 'bold';
      button.style.left = `${left}px`;
      button.style.top = `${top}px`;
      button.onclick = () => {
            event.stopPropagation();
            console.log(node.data);
            console.log(node.data('hiddenData'));
            catalogService.deleteQuestionFromCatalog(node.data('hiddenData'));
            node.data('label', '+');
            node.data('hiddenData', null);
            button.remove(); // Remove the button
      };

      // Append the button to the container
      document.getElementById('cy').appendChild(button);
    };
    const attachButtonToExistingNode = (nodeId) => {
      const node = cy.value.$id(nodeId);
      const position = node.renderedPosition();
      console.log("SSSSSSSSSSSSSSSSSSSSSSSSSSSSS");
      console.log(node.data('label'));
      console.log(position.x);
      console.log("SSSSSSSSSSSSSSSSSSSSSSSSSSSSS");
      if (node.data('label') !== '+' && position.x === 1655.7443609022555 && node.data('id') !== "invisible") {
          const button = document.createElement('button');
          button.innerText = 'x';
          button.className = 'remove-button';
          button.style.position = 'absolute';
          button.style.width = '70px';   // Set the button width
          button.style.height = '70px';  // Set the button height
          button.style.color = 'red';   // Set the text color to white
          const left = position.x - 300;
          const top = position.y;
          button.style.fontSize = '50px';  // Adjust font size to make "x" bigger
          button.style.fontWeight = 'bold';
          button.style.left = `${left}px`;
          button.style.top = `${top}px`;
          button.onclick = () => {
              event.stopPropagation();
              console.log(node.data);
              console.log(node.data('hiddenData'));
                catalogService.deleteQuestionFromCatalog(node.data('hiddenData'));
                node.data('label', '+');
                node.data('hiddenData', null);
                button.remove(); // Remove the button
          };

          // Append the button to the container
          document.getElementById('cy').appendChild(button);
      }
    }
    return { addNode, showModal, id, attachButtonToExistingNode, questionOptions, closeModal, addQuestion, transition} ;
  },
});
</script>

