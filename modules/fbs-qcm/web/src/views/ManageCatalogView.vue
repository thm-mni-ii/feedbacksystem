<template>
  <div class="cyto-container">
    <div class="graph-header">
      <h1>Fragefluss-Editor</h1>
      <p class="instructions">Klicken Sie auf die Knoten oder Verbindungen, um Änderungen vorzunehmen</p>
    </div>
    
    <div id="cy" class="cyto-graph"></div>
    
    <!-- Modal für das Hinzufügen einer neuen Frage -->
    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <div class="modal-header">
          <h3>Frage anfügen</h3>
          <button class="close-button" @click="closeModal">&times;</button>
        </div>
        
        <div class="modal-body">
          <div v-if="showInput" class="form-group">
            <label for="score-input">Ab wie viel Prozent soll weitergeleitet werden?</label>
            <div class="input-with-helper">
              <input
                id="score-input"
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
          
          <div class="form-group">
            <label for="question-select">Auf welche Frage soll verwiesen werden?</label>
            <select 
              id="question-select" 
              v-model="selectedQuestion" 
              class="form-control question-select"
            >
              <option disabled value="">Bitte wählen Sie eine Frage aus</option>
              <option v-for="question in questionOptions" :key="question._id" :value="question._id">
                {{ question.questiontext }}
              </option>
            </select>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="closeModal">Abbrechen</button>
          <button 
            class="btn btn-primary" 
            @click="addQuestion(nodeData, selectedQuestion, transition);"
            :disabled="!isFormValid"
          >
            Frage hinzufügen
          </button>
        </div>
      </div>
    </div>
    
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

<script lang="ts">
import { useRoute, useRouter } from 'vue-router';
import { defineComponent, ref, onMounted, computed } from 'vue';
import catalogService from '@/services/catalog.service';
import questionService from '@/services/question.service';
import cytoscape, { Core } from 'cytoscape';


export default defineComponent({
  name: 'CytoscapeGraph',
  setup() {
    const cy = ref<Core | null>(null); 
    const nodeId = ref(3); 
    const showModal = ref(false); 
    const showModalNum = ref(false); 
    const route = useRoute();
    const id = route.params;
    const currentQuestion = ref(null);
    const currentCatalog = ref(null);
    const questionOptions = ref([]);
    const transition = ref("");
    const showInput = ref(false);
    const nodeData = ref("");
    const selectedQuestion = ref("");
    const router = useRouter()


    // Computed property für die Formularvalidierung
    const isFormValid = computed(() => {
      if (showInput.value) {
        // Wenn Zahleneingabe sichtbar ist, müssen beide Felder gefüllt sein
        return nodeData.value && selectedQuestion.value;
      } else {
        // Sonst nur die Fragenauswahl
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
      
      currentQuestion.value = id.questionId;
      currentCatalog.value = id.catalogId;
      
      try {
        if(id.questionId !== "new") {
          const data = await catalogService.editCatalog(id.catalogId, id.questionId);
          if(data.data.isEmpty) {
              console.log("its true");
              buttonsHidden = "true"
          } else {   
            buttonsHidden = "false";
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
            const prevData = await catalogService.getPreviousQuestion(id.catalogId, data.data._id);
            if(prevData.data.questionInCatalogId !== null) {
              prevText = prevData.data.text;
              prevId = prevData.data.questionInCatalogId;
            }
          }
        } else if (id.questionId === "new") {
            const data = await catalogService.editEmptyCatalog(id.catalogId);
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
            { data: { id: 'left', label: prevText, hiddenData: prevId, hidden: buttonsHidden}, position: { x: 200, y: 0 }, grabbable: false }, // Weiter nach links
            { data: { source: 'left', target: 'center', hidden: buttonsHidden }},
            { data: { id: 'correct', label: maxKey, hiddenData: maxId, hidden: buttonsHidden }, position: { x: 650, y: -120 }, grabbable: false }, // Weiter rechts und oben
            { data: { source: 'center', target: 'correct', label: maxKeyNumber, hidden: buttonsHidden }, grabbable: false },
            { data: { id: 'partial', label: midKey, hiddenData: midId, hidden: buttonsHidden }, position: { x: 650, y: 0 }, grabbable: false }, // Weiter rechts
            { data: { source: 'center', target: 'partial', label: 'middle answer', hidden: buttonsHidden }, grabbable: false },
            { data: { id: 'incorrect', label: minKey, hiddenData: minId, hidden: buttonsHidden }, position: { x: 650, y: 120 }, grabbable: false }, // Weiter rechts und unten
            { data: { source: 'center', target: 'incorrect', label: minKeyNumber, hidden: buttonsHidden }, grabbable: false },
            { data: { id: 'invisible', label: '', hidden: "true" }, position: { x: 650, y: 60 }, grabbable: false } // Angepasst an neue Positionen
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
                'line-color': '#2c3e50',           // Dunklere Farbe für besseren Kontrast
                'target-arrow-color': '#2c3e50',   // Pfeilfarbe angepasst
                'target-arrow-shape': 'triangle',
                'curve-style': 'bezier',
                'label': 'data(label)',
                'font-size': '12px',               // Größere Schrift
                'font-weight': 'bold',             // Fettere Schrift
                'color': '#2c3e50',
                'text-background-opacity': 1,
                'text-background-color': '#ffffff',
                'text-background-padding': '4px',   // Mehr Padding um Text
                'text-background-shape': 'roundrectangle', // Abgerundete Ecken für Text-Hintergrund
                'width': '3px',                     // Dickere Linien
                'text-margin-y': '-10px',
                'arrow-scale': 1.5,                 // Größere Pfeile
                'text-outline-width': 0,            // Kein Text-Outline
                'text-border-width': 1,             // Text-Border für bessere Lesbarkeit
                'text-border-color': '#95a5a6',     // Farbe des Text-Borders
                'text-border-opacity': 1,
                'line-style': 'solid'               // Durchgezogene Linie (Alternativ: 'dashed')
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
        cy.value.on('layoutready', function() {
          cy.value.fit();
          cy.value.center();
        });
        // Event-Handler für Knotenklicks
        cy.value.on('tap', 'node', async (event) => {
            const clickedNode = event.target; 
            console.log(clickedNode.data('label'));
            console.log(clickedNode.data('hiddenData'));
            console.log(clickedNode.id());
            
            if (clickedNode.data('label') === '+') {
              attachButtonToNode(clickedNode.id());
              const data = await questionService.getAllQuestions();
              console.log(data);
              
              updateQuestionOptions(data.data);
              transition.value = clickedNode.id(); 
              
              if(clickedNode.id() !== "partial") {
                showInput.value = true;
              } else {
                showInput.value = false;
              }
              
              // Reset Form
              nodeData.value = "";
              selectedQuestion.value = "";
              showModal.value = true;
            } else if(clickedNode.data('hiddenData') !== null && clickedNode.data('hiddenData') !== undefined) {
                console.log(id.catalogId);
                console.log("warum passiert hier nichts");
                window.location.href = `/manageCatalog/${id.catalogId}/${clickedNode.data('hiddenData')}`
            }
        });
        
        // Event-Handler für Kantenklicks
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
        // Buttons an vorhandene Knoten anfügen
        cy.value.nodes().forEach((node) => {
            attachButtonToExistingNode(node.id());  
        });
        
      } catch (error) {
        console.error("Fehler beim Initialisieren des Graphen:", error);
      }
    });
    
    // Funktion zum Ändern des benötigten Scores
    const changeNeededScore = async (score, transition) => {
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
    
    // Funktion zum Aktualisieren der Fragenoptionen
    const updateQuestionOptions = (data) => {
      questionOptions.value = data;
    };
    
    // Funktion zum Schließen des Modals
    const closeModal = () => {
        showModal.value = false;
        showModalNum.value = false;
        nodeData.value = "";
        selectedQuestion.value = "";
    };
    
    // Funktion zum Hinzufügen einer Frage
    const addQuestion = async (score, questionId, transition) => {
        try {
          console.log("Füge Frage hinzu:", score, questionId, transition);
          console.log("IN DEN FOLGENDEN KATALOG:", currentCatalog.value);
          console.log("IN DEN FOLGENDEN KATALOG:", id.catalogId);
          const res = await questionService.addQuestionToCatalog(questionId, currentCatalog.value);  
          console.log(res);
          
          const question = route.params.questionId;
          console.log(question);
          
          if(question !== "new" && question !== "open") {
              const res2 = await catalogService.addChildrenToQuestion(question, res.data.id, score, transition);
              console.log("PASSIERT DA WAS");
              showModal.value = false;
              location.reload();
          } else {
              window.location.href = `/manageCatalog/${id.catalogId}/${res.data.id}`
          }
        } catch (error) {
          console.error("Fehler beim Hinzufügen der Frage:", error);
        }
    };
    
    // Funktion zum Anfügen eines Buttons an einen Knoten
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
      button.style.width = '30px';
      button.style.height = '30px';
      button.style.color = 'white';
      button.style.backgroundColor = '#e74c3c';
      button.style.border = 'none';
      button.style.borderRadius = '50%';
      button.style.cursor = 'pointer';
      button.style.fontSize = '16px';
      button.style.fontWeight = 'bold';
      button.style.display = 'flex';
      button.style.alignItems = 'center';
      button.style.justifyContent = 'center';
      button.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
      
      const left = position.x - 200;
      const top = position.y;
      
      button.style.left = `${left}px`;
      button.style.top = `${top}px`;
      
      button.onclick = (event) => {
            event.stopPropagation();
            console.log(node.data);
            console.log(node.data('hiddenData'));
            catalogService.deleteQuestionFromCatalog(node.data('hiddenData'));
            node.data('label', '+');
            node.data('hiddenData', null);
            button.remove(); 
      };
      
      document.getElementById('cy').appendChild(button);
    };
    
    // Funktion zum Anfügen eines Buttons an einen vorhandenen Knoten
    const attachButtonToExistingNode = (nodeId) => {
      const node = cy.value.$id(nodeId);
      const position = node.renderedPosition();
      
      if (node.data('label') !== '+' && position.x === 1180.109022556391 && node.data('id') !== "invisible") {
          const button = document.createElement('button');
          
          button.innerText = 'x';
          button.className = 'remove-button';
          button.style.position = 'absolute';
          button.style.width = '30px';
          button.style.height = '30px';
          button.style.color = 'white';
          button.style.backgroundColor = '#e74c3c';
          button.style.border = 'none';
          button.style.borderRadius = '50%';
          button.style.cursor = 'pointer';
          button.style.fontSize = '16px';
          button.style.fontWeight = 'bold';
          button.style.display = 'flex';
          button.style.alignItems = 'center';
          button.style.justifyContent = 'center';
          button.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
          
          const left = position.x - 200;
          const top = position.y;
          
          button.style.left = `${left}px`;
          button.style.top = `${top}px`;
          
          button.onclick = (event) => {
              event.stopPropagation();
              console.log(node.data);
              console.log(node.data('hiddenData'));
              catalogService.deleteQuestionFromCatalog(node.data('hiddenData'));
              node.data('label', '+');
              node.data('hiddenData', null);
              button.remove(); 
          };
          
          document.getElementById('cy').appendChild(button);
      }
    };
    
    return { 
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
      isFormValid
    };
  },
});
</script>