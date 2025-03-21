<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Frage auswählen</h3>
        <button class="close-button" @click="cancel">&times;</button>
      </div>
      
      <div class="modal-body">
        <div class="form-group">
          <label for="question-search">Frage suchen</label>
          <input
            id="question-search"
            type="text"
            v-model="searchQuery"
            placeholder="Suchbegriff eingeben"
            class="form-control"
          />
        </div>
        
        <div class="form-group">
          <label>Zu welcher Frage möchten Sie weiterleiten?</label>
          <div class="datatable-container">
            <table class="datatable">
              <thead>
                <tr>
                  <th>Frage</th>
                  <th class="action-column">Auswahl</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="question in filteredQuestions" :key="question._id" 
                    :class="{ 'selected-row': selectedQuestion === question._id }">
                  <td>{{ question.questiontext }}</td>
                  <td class="action-column">
                    <button 
                      class="select-button" 
                      @click="selectQuestion(question._id)"
                      :class="{ 'selected': selectedQuestion === question._id }">
                      {{ selectedQuestion === question._id ? '✓' : 'Wählen' }}
                    </button>
                  </td>
                </tr>
                <tr v-if="filteredQuestions.length === 0">
                  <td colspan="2" class="no-data">
                    Keine Fragen gefunden. Bitte passen Sie Ihre Suche an.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        
        <div v-if="showInput" class="form-group">
          <label for="score-input">Schwellenwert für Weiterleitung</label>
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
          <small class="form-text text-muted">
            Ab diesem Prozentwert wird zur ausgewählten Frage weitergeleitet.
          </small>
        </div>
      </div>
      
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="cancel">Abbrechen</button>
        <button 
          class="btn btn-primary" 
          @click="confirm" 
          :disabled="!selectedQuestion">
          Auswählen
        </button>
      </div>
    </div>
  </div>
</template>
    
<script lang="ts">
  import { defineComponent, ref, watch, computed } from 'vue';

  interface QuestionOption {
    _id: string;
    questiontext: string;
    [key: string]: any;
  }

  export default defineComponent({
    name: 'QuestionFindModal',
    props: {
      show: {
        type: Boolean,
        default: false
      },
      showInput: {
        type: Boolean,
        default: true
      },
      questionOptions: {
        type: Array as () => QuestionOption[],
        required: true,
        default: () => []
      },
      initialNodeData: {
        type: [String, Number],
        default: 0
      },
      transition: {
        type: String,
        default: "correct"
      }
    },
    emits: ['cancel', 'confirm'],
    setup(props, { emit }) {
      const selectedQuestion = ref('');
      const nodeData = ref(props.initialNodeData);
      const transitionValue = ref(props.transition);
      const searchQuery = ref('');

      // Filter questions based on search query
      const filteredQuestions = computed(() => {
        if (!searchQuery.value) {
          return props.questionOptions;
        }
        
        const query = searchQuery.value.toLowerCase();
        return props.questionOptions.filter(question => 
          question.questiontext.toLowerCase().includes(query)
        );
      });

      const selectQuestion = (id: string) => {
        selectedQuestion.value = id;
      };

      const cancel = () => {
        emit('cancel');
      };

      const confirm = () => {
        if (selectedQuestion.value) {
          emit('confirm', nodeData.value, selectedQuestion.value, transitionValue.value);
        }
      };

      // Reset form when modal is shown
      watch(() => props.show, (newValue) => {
        if (newValue) {
          selectedQuestion.value = '';
          nodeData.value = props.initialNodeData;
          transitionValue.value = props.transition;
          searchQuery.value = '';
        }
      });

      return {
        selectedQuestion,
        nodeData,
        transitionValue,
        searchQuery,
        filteredQuestions,
        selectQuestion,
        cancel,
        confirm
      };
    }
  });
</script>
    
<style scoped>
  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
  }

  .modal-content {
    background-color: white;
    border-radius: 8px;
    width: 95%;
    max-width: 600px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  }

  .modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16px 20px;
    border-bottom: 1px solid #eaeaea;
  }

  .modal-header h3 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
    color: #333;
  }

  .close-button {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;
  }

  .modal-body {
    padding: 20px;
  }

  .form-group {
    margin-bottom: 20px;
  }

  .form-group label {
    display: block;
    margin-bottom: 8px;
    font-weight: 500;
    color: #444;
  }

  .form-control {
    width: 100%;
    padding: 10px 12px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 14px;
  }

  .datatable-container {
    max-height: 250px;
    overflow-y: auto;
    border: 1px solid #eaeaea;
    border-radius: 4px;
  }

  .datatable {
    width: 100%;
    border-collapse: collapse;
  }

  .datatable th, .datatable td {
    padding: 10px 12px;
    text-align: left;
    border-bottom: 1px solid #eaeaea;
  }

  .datatable th {
    background-color: #f9f9f9;
    font-weight: 600;
    position: sticky;
    top: 0;
    z-index: 1;
  }

  .datatable tr:hover {
    background-color: #f5f5f5;
  }

  .datatable .action-column {
    width: 80px;
    text-align: center;
  }

  .select-button {
    padding: 4px 8px;
    border-radius: 4px;
    border: 1px solid #ccc;
    background-color: #f9f9f9;
    cursor: pointer;
    font-size: 12px;
  }

  .select-button.selected {
    background-color: #3498db;
    color: white;
    border-color: #2980b9;
  }

  .selected-row {
    background-color: #ebf5fb;
  }

  .no-data {
    text-align: center;
    padding: 20px;
    color: #666;
  }

  .input-with-helper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .input-suffix {
    position: absolute;
    right: 12px;
    color: #666;
  }

  .input-with-helper input {
    padding-right: 30px;
  }

  .form-text {
    font-size: 12px;
    margin-top: 5px;
  }

  .modal-footer {
    display: flex;
    justify-content: flex-end;
    padding: 16px 20px;
    border-top: 1px solid #eaeaea;
    gap: 10px;
  }

  .btn {
    padding: 8px 16px;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
    border: none;
  }

  .btn-primary {
    background-color: #3498db;
    color: white;
  }

  .btn-primary:disabled {
    background-color: #a0cfee;
    cursor: not-allowed;
  }

  .btn-secondary {
    background-color: #f2f2f2;
    color: #333;
  }
</style>