<template>
  <div class="welcome-container">
    <div class="welcome-content">
      <h1 class="welcome-title">Python Code Editor</h1>
      <p class="welcome-description">
        Willkommen bei unserem Python Code Editor. Hier können Sie Python-Code schreiben, 
        ausführen und speichern.
      </p>
      
      <div class="features">
        <div class="feature-item">
          <h3>💻 Code Editor</h3>
          <p>Vollwertiger Code-Editor mit Syntax-Highlighting</p>
        </div>
        <div class="feature-item">
          <h3>🚀 Code Ausführung</h3>
          <p>Führen Sie Ihren Python-Code direkt im Browser aus</p>
        </div>
        <div class="feature-item">
          <h3>💾 Speichern</h3>
          <p>Speichern Sie Ihren Code für spätere Bearbeitung</p>
        </div>
      </div>

      <button @click="goToEditor" class="start-button">
        Code Editor starten
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goToEditor = () => {
  router.push('/editor')
}
</script>

<style scoped>
.welcome-container {
  height: 100vh;
  width: 100vw;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.welcome-content {
  text-align: center;
  max-width: 800px;
  padding: 2rem;
}

.welcome-title {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.welcome-description {
  font-size: 1.2rem;
  margin-bottom: 3rem;
  line-height: 1.6;
  opacity: 0.9;
}

.features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.feature-item {
  background: rgba(255, 255, 255, 0.1);
  padding: 1.5rem;
  border-radius: 10px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.feature-item h3 {
  margin: 0 0 0.5rem 0;
  font-size: 1.3rem;
}

.feature-item p {
  margin: 0;
  opacity: 0.9;
  line-height: 1.4;
}

.start-button {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 1rem 2rem;
  font-size: 1.2rem;
  border-radius: 50px;
  cursor: pointer;
  font-weight: bold;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.start-button:hover {
  background: #45a049;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.start-button:active {
  transform: translateY(0);
}

@media (max-width: 768px) {
  .welcome-title {
    font-size: 2rem;
  }
  
  .welcome-content {
    padding: 1rem;
  }
  
  .features {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
}
</style>