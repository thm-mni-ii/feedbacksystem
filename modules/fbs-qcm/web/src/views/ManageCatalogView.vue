<template>
  <div class="cyto-container">
    <DialogEditQuestion ref="dialogEditQuestion" />
    <div class="graph-header">
      <h1>Fragefluss-Editor</h1>
      <p class="instructions">Klicken Sie auf die Knoten oder Verbindungen, um Änderungen vorzunehmen</p>
    </div>
    
    <div id="cy" class="cyto-graph"></div>
    
    <DialogAddQuestion ref="dialogAddQuestion" />

    <!-- Modal für das Ändern des Schwellenwerts -->
    <div v-if="showModalNum" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Weiterleitung ändern</h3>
          <button class="close-button" @click="closeModal">&times;</button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label for="threshold-input">Ab wie viel Prozent soll weitergeleitet werden?</label>
            <div class="input-with-helper">
              <input
                id="threshold-input"
                type="number"
                min="0"
                max="100"
                v-model="nodeData"
                placeholder="Prozentwert eingeben"
                class="form-control"
              />
              <span class="input-suffix">%</span>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeModal">Abbrechen</button>
          <button 
            class="btn btn-primary" 
            @click="changeNeededScore(nodeData, transition);"
            :disabled="!nodeData"
          >
            Schwellenwert aktualisieren
          </button>
        </div>
      </div>
    </div>
    <!-- Modal für die Löschbestätigung -->
    <delete-confirmation-modal
      :show="showDeleteModal"
      :question-id="nodeToDelete ? nodeToDelete.id : ''"
      @cancel="cancelDelete"
      @confirm="confirmDelete"
    />
  </div>
</template>

<style scoped>
/* Grundlegende Stile für die Seite */
.cyto-container {
  background-color: #f8f9fa;
  padding: 20px;
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.graph-header {
  text-align: center;
  margin-bottom: 30px;
  color: #2c3e50;
}

.instructions {
  color: #6c757d;
  font-size: 14px;
}

.cyto-graph {
  width: 100%;
  height: 500px; /* Kleiner, da wir nicht zoomen werden */
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  margin-bottom: 30px;
  overflow: hidden; /* Verhindert Scrollbars */
}

/* Verbesserte Knotenstile für bessere Sichtbarkeit */
node {
  font-size: 14px !important; /* Größere Schrift */
  text-outline-width: 2px !important; /* Besserer Text-Kontrast */
  text-max-width: 140px !important; /* Größere Textbreite */
}

/* Stil für den Haupt-/Zentrum-Knoten */
#center {
  width: 180px !important; /* Breiter für bessere Lesbarkeit */
  height: 60px !important; /* Höher für bessere Lesbarkeit */
  font-size: 16px !important; /* Größere Schrift */
}


/* Modal Overlay mit verbessertem Kontrast */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  backdrop-filter: blur(3px);
}

/* Modal Content mit verbesserten Farben und Kontrast */
.modal-content {
  background-color: #ffffff;
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  animation: modalAppear 0.3s ease-out;
}

@keyframes modalAppear {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Modal Header */
.modal-header {
  background-color: #3498db;
  color: white;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid #e0e0e0;
}

.modal-header h3 {
  margin: 0;
  font-size: 1.3rem;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  padding: 0;
  line-height: 1;
}

.close-button:hover {
  color: #f1f1f1;
}

/* Modal Body */
.modal-body {
  padding: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2c3e50;
}

.form-control {
  width: 100%;
  padding: 12px;
  border: 2px solid #dcdfe6;
  border-radius: 4px;
  font-size: 16px;
  color: #333;
  transition: border-color 0.3s;
}

.form-control:focus {
  border-color: #3498db;
  outline: none;
  box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.25);
}

.question-select {
  height: auto;
  max-height: 150px;
}

.input-with-helper {
  position: relative;
  display: flex;
  align-items: center;
}

.input-suffix {
  position: absolute;
  right: 12px;
  color: #6c757d;
  font-weight: bold;
}

/* Modal Footer */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  padding: 15px 20px;
  background-color: #f8f9fa;
  border-top: 1px solid #e0e0e0;
}

/* Buttons */
.btn {
  padding: 10px 20px;
  font-size: 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  border: none;
}

.btn-primary {
  background-color: #3498db;
  color: white;
}

.btn-primary:hover {
  background-color: #2980b9;
}

.btn-primary:disabled {
  background-color: #95a5a6;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #95a5a6;
  color: white;
}

.btn-secondary:hover {
  background-color: #7f8c8d;
}
</style>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { ref, onMounted, computed } from 'vue';
import catalogService from '@/services/catalog.service';
import questionService from '@/services/question.service';
import cytoscape from 'cytoscape'; 
import type { Core } from 'cytoscape';
import DeleteConfirmationModal from '@/components/DeleteConfirmationModal.vue';
import QuestionFindModal from '@/components/QuestionFindModal.vue';
import DialogAddQuestion from '@/dialog/DialogAddQuestion.vue';


const dialogAddQuestion = ref<InstanceType<typeof DialogAddQuestion> | null>(null);
const route = useRoute();
const id = route.params;

const cy = ref<Core | null>(null);
const showModal = ref(false);
const showModalNum = ref(false);
const currentQuestion = ref<string | null>(null);
const currentCatalog = ref<string | null>(null);
const questionOptions = ref([]);
const transition = ref("");
const showInput = ref(false);
const nodeData = ref("");
const selectedQuestion = ref("");
const firstQuestion = ref(false);
const showDeleteModal = ref(false);
const nodeToDelete = ref<{id: string; nodeId: string} | null>(null);

const isFormValid = computed(() => {
  if (showInput.value) {
    return nodeData.value && selectedQuestion.value;
  } else {
    return selectedQuestion.value;
  }
});

onMounted(async () => {
  console.log('ID from query parameter:', id.questionId);      
  console.log('ID from query parameter:', id.catalogId);

  let maxKey = "+";
  let midKey = "+";
  let minKey = "+";
  let maxId = null;
  let midId = null;
  let minId = null;
  let maxKeyNumber = "correct";
  let midKeyNumber = "medium";
  let minKeyNumber = "incorrect";
  let questionText = "+";
  let prevText = "No Previous Question"
  let prevId = null;
  let buttonsHidden = "false";
  
  currentQuestion.value = id.questionId as string;
  currentCatalog.value = id.catalogId as string;
  
  try {
    if(id.questionId !== "new") {
      const data = await catalogService.editCatalog(id.catalogId as string, id.questionId as string);
      if(data.data.isEmpty) {
        console.log("its true");
        buttonsHidden = "true"
        firstQuestion.value = true;
      } else {   
        buttonsHidden = "false";
        currentQuestion.value = data.data._id
        console.log(data.data);
        
        questionText = data.data.questionText;
        
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
        console.log(data.data);
        const prevData = await catalogService.getPreviousQuestion(id.catalogId as string, data.data._id);
        if(prevData.data.questionInCatalogId !== null) {
          prevText = prevData.data.text;
          prevId = prevData.data.questionInCatalogId;
        }
      }
    } else if (id.questionId === "new") {
      const data = await catalogService.editEmptyCatalog(id.catalogId as string);
      if(data.data.isEmpty) {
        buttonsHidden = "true";
      } else {
        console.log("you shouldn't be here");
      }
    }
    cy.value = cytoscape({
      container: document.getElementById('cy'),
      elements: [
        { data: { id: 'center', label: questionText }, position: { x: 400, y: 0 }, grabbable: false},
        { data: { id: 'left', label: prevText, hiddenData: prevId, hidden: buttonsHidden}, position: { x: 200, y: 0 }, grabbable: false },
        { data: { source: 'left', target: 'center', hidden: buttonsHidden }},
        { data: { id: 'correct', label: maxKey, hiddenData: maxId, hidden: buttonsHidden }, position: { x: 650, y: -120 }, grabbable: false },
        { data: { source: 'center', target: 'correct', label: maxKeyNumber, hidden: buttonsHidden }, grabbable: false },
        { data: { id: 'partial', label: midKey, hiddenData: midId, hidden: buttonsHidden }, position: { x: 650, y: 0 }, grabbable: false },
        { data: { source: 'center', target: 'partial', label: 'middle answer', hidden: buttonsHidden }, grabbable: false },
        { data: { id: 'incorrect', label: minKey, hiddenData: minId, hidden: buttonsHidden }, position: { x: 650, y: 120 }, grabbable: false },
        { data: { source: 'center', target: 'incorrect', label: minKeyNumber, hidden: buttonsHidden }, grabbable: false },
        { data: { id: 'invisible', label: '', hidden: "true" }, position: { x: 650, y: 60 }, grabbable: false }
      ],
      style: [
        { 
          selector: 'node', 
          style: { 
            'background-color': '#3498db', 
            'label': 'data(label)', 
            'shape': 'rectangle', 
            'color': '#ffffff', 
            'text-valign': 'center', 
            'text-halign': 'center', 
            'border-width': '2px',
            'border-color': '#2980b9', 
            'width': '120px', 
            'height': '40px', 
            'font-size': '12px',
            'text-outline-width': '1px',
            'text-outline-color': '#2980b9',
            'text-wrap': 'wrap',
            'text-max-width': '110px'
          } 
        },
        { 
          selector: 'edge', 
          style: { 
            'line-color': '#2c3e50',           
            'target-arrow-color': '#2c3e50',   
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'label': 'data(label)',
            'font-size': '12px',               
            'font-weight': 'bold',             
            'color': '#2c3e50',
            'text-background-opacity': 1,
            'text-background-color': '#ffffff',
            'text-background-padding': '4px',   
            'text-background-shape': 'roundrectangle', 
            'width': '3px',                     
            'text-margin-y': '-10px',
            'arrow-scale': 1.5,                 
            'text-outline-width': 0,            
            'text-border-width': 1,             
            'text-border-color': '#95a5a6',     
            'text-border-opacity': 1,
            'line-style': 'solid'               
          } 
        },
        { 
          selector: 'node[label="+"]', 
          style: { 
            'background-color': '#27ae60', 
            'label': '+', 
            'width': '40px', 
            'height': '40px', 
            'shape': 'round-rectangle', 
            'color': 'white',
            'font-size': '24px',
            'border-color': '#219653',
            'text-valign': 'center',
            'text-halign': 'center'
          } 
        },
        { 
          selector: 'node#center', 
          style: { 
            'background-color': '#e74c3c', 
            'border-color': '#c0392b',
            'width': '150px', 
            'height': '50px',
            'font-weight': 'bold',
            'font-size': '14px'
          } 
        },
        { selector: 'node[hidden = "true"]', style: { 'visibility': 'hidden' } },
        { selector: 'edge[hidden = "true"]', style: { 'visibility': 'hidden' } }
      ],
      layout: { name: 'preset' },
      userPanningEnabled: false,
      userZoomingEnabled: false,
      zoom: 1.4,
      minZoom: 1.4,
      maxZoom: 1.4,
      fit: true,
      padding: 50,
      boxSelectionEnabled: false,
      autoungrabify: true,
      autounselectify: true
    });

    cy.value.on('tap', 'node', async (event) => {
      const clickedNode = event.target; 
      
      if (clickedNode.data('label') === '+') {
        const data = await questionService.getAllQuestions();
        const questionOptions = data.data;
        
        transition.value = clickedNode.id(); 
        
        const showInput = !(clickedNode.id() === "partial" || firstQuestion.value || currentQuestion.value === "new");
        
        const result = await dialogAddQuestion.value?.openDialog(questionOptions, showInput, transition.value);
        
        if (result) {
          await addQuestion(result.nodeData, result.selectedQuestion, result.transition);
        }
      } else if(clickedNode.data('hiddenData') !== null && clickedNode.data('hiddenData') !== undefined) {
        window.location.href = `/manageCatalog/${id.catalogId}/${clickedNode.data('hiddenData')}`
      }
});
    
    cy.value.on('click', 'edge', async (event) => {
      const edge = event.target;
      console.log("edge");
      console.log(edge.data());
      const data = edge.data();
      
      if(data.target === "correct") {
        transition.value = "correct";
        nodeData.value = data.label ? data.label.replace('%', '') : "";
        showModalNum.value = true;
      }
      
      if(data.target === "incorrect") {
        transition.value = "incorrect";
        nodeData.value = data.label ? data.label.replace('%', '') : "";
        showModalNum.value = true;
      }
    }); 

    cy.value.nodes().forEach((node) => {
      attachButtonToExistingNode(node.id());  
    });
    
  } catch (error) {
    console.error("Fehler beim Initialisieren des Graphen:", error);
  }
});

const changeNeededScore = async (score: number, transition: string) => {
  try {
    const question = id.questionId;
    console.log("Ändere Score für Frage:", question);
    const result = await catalogService.changeNeededScore(question, score, transition);
    console.log(result);
    showModalNum.value = false;
    location.reload();
  } catch (error) {
    console.error("Fehler beim Ändern des Scores:", error);
  }
};

const updateQuestionOptions = (data: any[]) => {
  questionOptions.value = data;
};

const closeModal = () => {
  showModal.value = false;
  showModalNum.value = false;
  nodeData.value = "";
  selectedQuestion.value = "";
};

const addQuestion = async (score: number, questionId: string, transition: string) => {
  try {
    console.log("Füge Frage hinzu:", score, questionId, transition);
    console.log("IN DEN FOLGENDEN KATALOG:", currentCatalog.value);
    console.log("IN DEN FOLGENDEN KATALOG:", id.catalogId);
    const res = await questionService.addQuestionToCatalog(questionId, currentCatalog.value);  
    console.log(res);
    
    const question = currentQuestion.value;
    
    if(question !== "new" && question !== "open") {
      await catalogService.addChildrenToQuestion(question, res.data.id, score, transition);
      showModal.value = false;
      location.reload();
    } else {
      window.location.href = `/manageCatalog/${id.catalogId}/${res.data.id}`
    }
  } catch (error) {
    console.error("Fehler beim Hinzufügen der Frage:", error);
  }
};

const attachButtonToExistingNode = (nodeId: string) => {
  if (!cy.value) return;
  
  const node = cy.value.$id(nodeId);
  
  if ((nodeId === 'correct' || nodeId === 'partial' || nodeId === 'incorrect') && 
      node.data('label') !== '+') {
    const position = node.renderedPosition();
    const button = document.createElement('button');

    button.setAttribute('type', 'button');
    
    button.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg>';
    button.className = 'remove-button';
    button.style.position = 'absolute';
    button.style.width = '30px';
    button.style.height = '30px';
    button.style.color = 'white';
    button.style.backgroundColor = '#e74c3c';
    button.style.border = 'none';
    button.style.borderRadius = '50%';
    button.style.cursor = 'pointer';
    button.style.display = 'flex';
    button.style.alignItems = 'center';
    button.style.justifyContent = 'center';
    button.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    button.style.transition = 'transform 0.2s, background-color 0.2s';
    
    button.onmouseover = () => {
      button.style.backgroundColor = '#c0392b';
      button.style.transform = 'scale(1.1)';
    };
    
    button.onmouseout = () => {
      button.style.backgroundColor = '#e74c3c';
      button.style.transform = 'scale(1)';
    };
    
    const left = position.x + 85;
    const top = position.y - 30;
    
    button.style.left = `${left}px`;
    button.style.top = `${top}px`;
    button.style.zIndex = '10';
    
    button.onclick = (event) => {
      event.stopPropagation();
      nodeToDelete.value = {
        id: node.data('hiddenData'),
        nodeId: node.id()
      };
      showDeleteModal.value = true;
    }
    document.getElementById('cy')?.appendChild(button);
  }
};

const cancelDelete = () => {
  showDeleteModal.value = false;
  nodeToDelete.value = null;
};

const confirmDelete = async (questionId: string) => {
  try {
    await catalogService.deleteQuestionFromCatalog(questionId);
    showDeleteModal.value = false;
    location.reload();
  } catch (error) {
    console.error("Fehler beim Löschen der Frage:", error);
  }
};

const cancelAdd = () => {
  showModal.value = false;
}

const confirmAdd = (nodeData: number, selectedQuestion: string, transition: string) => {
  addQuestion(nodeData, selectedQuestion, transition);
  showModal.value = false;
}

defineExpose({
  showModal, 
  showModalNum, 
  id, 
  attachButtonToExistingNode, 
  questionOptions, 
  closeModal, 
  addQuestion, 
  transition, 
  showInput, 
  changeNeededScore,
  nodeData,
  selectedQuestion,
  isFormValid,
  showDeleteModal,
  nodeToDelete,
  cancelDelete,
  confirmDelete,
  cancelAdd,
  confirmAdd,
});
</script>