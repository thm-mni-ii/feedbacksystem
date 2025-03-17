<template>
  <div v-if="show" class="modal-overlay">
    <div class="modal-content">
      <div class="modal-header">
        <h3>Frage entfernen</h3>
        <button class="close-button" @click="cancel">&times;</button>
      </div>
      
      <div class="modal-body">
        <div class="warning-icon">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
            <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
          </svg>
        </div>
        <p class="confirmation-message">Sind Sie sicher, dass Sie diese Frage entfernen möchten?</p>
        <p class="confirmation-details">Diese Aktion kann nicht rückgängig gemacht werden und entfernt die Frage aus dem Katalog und alle Fragen, die ihr folgen.</p>
      </div>
      
      <div class="modal-footer">
        <button class="btn btn-secondary" @click="cancel">Abbrechen</button>
        <button class="btn btn-danger" @click="confirm">Entfernen</button>
      </div>
    </div>
  </div>  
</template>
  
<script lang="ts">
  import { defineComponent } from 'vue';
  
  export default defineComponent({
    name: 'DeleteConfirmationModal',
    props: {
      show: {
        type: Boolean,
        default: false
      },
      questionId: {
        type: String,
        default: ''
      }
    },
    emits: ['cancel', 'confirm'],
    setup(props, { emit }) {
      const cancel = () => {
        emit('cancel');
      };
  
      const confirm = () => {
        emit('confirm', props.questionId);
      };
  
      return {
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
    background-color: rgba(0, 0, 0, 0.7);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
    backdrop-filter: blur(3px);
  }
  
  .modal-content {
    background-color: #ffffff;
    border-radius: 8px;
    width: 400px;
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
  
  .modal-header {
    background-color: #e74c3c;
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
  
  .modal-body {
    padding: 20px;
    text-align: center;
  }
  
  .warning-icon {
    margin-bottom: 15px;
    color: #e74c3c;
  }
  
  .confirmation-message {
    font-size: 18px;
    font-weight: 600;
    margin-bottom: 10px;
    color: #2c3e50;
  }
  
  .confirmation-details {
    color: #7f8c8d;
    margin-bottom: 5px;
  }
  
  .modal-footer {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    padding: 15px 20px;
    background-color: #f8f9fa;
    border-top: 1px solid #e0e0e0;
  }
  
  .btn {
    padding: 10px 20px;
    font-size: 16px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s;
    border: none;
  }
  
  .btn-secondary {
    background-color: #95a5a6;
    color: white;
  }
  
  .btn-secondary:hover {
    background-color: #7f8c8d;
  }
  
  .btn-danger {
    background-color: #e74c3c;
    color: white;
  }
  
  .btn-danger:hover {
    background-color: #c0392b;
  }
  </style>