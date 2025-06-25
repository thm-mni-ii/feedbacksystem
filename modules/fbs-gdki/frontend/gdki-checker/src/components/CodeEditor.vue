<template>
  <div class="editor-fullscreen">
    <div class="editor-header">
      <button @click="goBack" class="back-button">
        ← Zurück
      </button>
      <div class="header-actions">
        <button @click="runCode" class="run-button" :disabled="isRunning">
          {{ isRunning ? 'Running...' : 'Run Code' }}
        </button>
        <button @click="saveCode" class="save-button" :disabled="isRunning">
          {{ 'Save' }}
        </button>
        <button @click="hint" class="Hint-button" :disabled="isRunning">
          {{ 'Hint' }}
        </button>
      </div>
    </div>
    <div class="editor-layout">
      <div ref="editorContainer" class="editor-container"></div>
      <div class="right-panel">
        <div class="output-container">
          <div class="output-header">Output</div>
          <pre ref="outputContainer" class="output-content">{{ output }}</pre>
        </div>
        <div class="hints-container">
          <div class="hints-header">Hints</div>
          <div class="hints-content">{{ hints }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { EditorView } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { basicSetup } from 'codemirror'
import { python } from '@codemirror/lang-python'
import storeService from '../services/storeService'
import codeService from '../services/codeService'

const router = useRouter()
const editorContainer = ref(null)
const outputContainer = ref(null)
const output = ref('')
const hints = ref('Click "Hint" button to get help with your code...')
const isRunning = ref(false)
let editorView = null

const goBack = () => {
  router.push('/')
}

onMounted(async () => {
  // Initialize editor with enhanced theme for better syntax highlighting visibility
  const state = EditorState.create({
    doc: await getCode(),
    extensions: [
      basicSetup,
      python(),
      EditorView.theme({
        "&": {
          height: "100%",
          width: "100%",
          fontSize: "14px"
        },
        ".cm-scroller": {
          overflow: "auto",
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Consolas', 'Courier New', monospace"
        },
        ".cm-content, .cm-gutter": {
          minHeight: "100%"
        },
        ".cm-editor": {
          height: "100%"
        },
        ".cm-focused": {
          outline: "none"
        },
        // Enhanced syntax highlighting - these classes are provided by the python() extension
        "&.cm-editor .cm-content": {
          backgroundColor: "#ffffff"
        },
        // Python syntax highlighting colors
        ".tok-keyword": { 
          color: "#0000ff !important", 
          fontWeight: "bold" 
        },
        ".tok-string": { 
          color: "#008000 !important" 
        },
        ".tok-comment": { 
          color: "#808080 !important", 
          fontStyle: "italic" 
        },
        ".tok-number": { 
          color: "#ff6600 !important" 
        },
        ".tok-operator": { 
          color: "#000000 !important" 
        },
        ".tok-punctuation": { 
          color: "#000000 !important" 
        },
        ".tok-function": { 
          color: "#795e26 !important",
          fontWeight: "bold"
        },
        ".tok-variableName": { 
          color: "#001080 !important" 
        },
        ".tok-definition": {
          color: "#795e26 !important",
          fontWeight: "bold"
        },
        ".tok-builtin": {
          color: "#0451a5 !important",
          fontWeight: "bold"
        },
        ".tok-docstring": {
          color: "#008000 !important",
          fontStyle: "italic"
        }
      }, { dark: false }),
      EditorView.lineWrapping
    ]
  })
  
  editorView = new EditorView({
    state,
    parent: editorContainer.value
  })
})

const saveCode = async () => {
  storeService.SaveCodeInTask(1, editorView.state.doc.toString())
}

const hint = async () => {
    hints.value = "Loading hint...";
    try {
        const result = await codeService.getHint("685118ee475d85b7e5feba18", editorView.state.doc.toString())
        const res1 = result.data.choices[0].message.content;
        console.log(res1);
        // Assuming the result contains the hint text
        if (result && result.data) {
            hints.value = res1;
        } else if (result) {
            hints.value = res1;
        }
    } catch (error) {
        console.error("Error fetching hint:", error);
        hints.value = "Error loading hint. Please try again later.";
    }
}

const getCode = async () => {
  const response = await storeService.getCodeFromTask(1)
  const code = response.data.text
  console.log(code)
  if(code === "" || code === undefined) {
    return `# Python-Beispielcode mit Syntax-Highlighting
def greet(name):
    """Begrüßt eine Person mit einer freundlichen Nachricht"""
    if name:
        return f"Hallo, {name}! Willkommen!"
    else:
        return "Hallo, unbekannte Person!"

# Variablen und verschiedene Datentypen
x = 42
pi = 3.14159
message = "Willkommen in Python!"
is_awesome = True
my_list = [1, 2, 3, 4, 5]

# Kontrollstrukturen
for num in my_list:
    if num % 2 == 0:
        print(f"{num} ist eine gerade Zahl")
    else:
        print(f"{num} ist eine ungerade Zahl")

# Funktionsaufruf
result = greet("Welt")
print(result)

# Mehr komplexer Code für bessere Syntax-Hervorhebung
class Calculator:
    def __init__(self):
        self.history = []
    
    def add(self, a, b):
        result = a + b
        self.history.append(f"{a} + {b} = {result}")
        return result

# Instanziierung und Verwendung
calc = Calculator()
sum_result = calc.add(10, 5)
print(f"Ergebnis: {sum_result}")`
  }
  return code;
}

const runCode = async () => {
    isRunning.value = true
    output.value = "Running...\n";
    const response = await codeService.executeCode("1", editorView.state.doc.toString());
    if(response.data.status == "error") {
        const errorMessage = `${response.data.error.name}\n${response.data.error.message}`;
        output.value = errorMessage;
        isRunning.value = false;
        return;
    }
    output.value = response.data.results[0].text;
    isRunning.value = false
}

onBeforeUnmount(() => {
  if (editorView) editorView.destroy()
})
</script>

<style scoped>
.editor-fullscreen {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Header with run button */
.editor-header {
  padding: 8px 12px;
  background-color: #f0f0f0;
  border-bottom: 1px solid #ddd;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.back-button {
  background-color: #6c757d;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  transition: background-color 0.2s;
}

.back-button:hover {
  background-color: #5a6268;
}

.save-button {
  background-color: royalblue;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.save-button:hover {
  background-color: #1e5bb8;
}

.run-button {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.run-button:hover {
  background-color: #45a049;
}

.run-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

.Hint-button {
  background-color: #ff9800;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
}

.Hint-button:hover {
  background-color: #e68900;
}

.Hint-button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
}

/* Layout for editor and panels */
.editor-layout {
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
}

@media (min-width: 768px) {
  .editor-layout {
    flex-direction: row;
  }
}

/* Right panel container for output and hints */
.right-panel {
  height: 50%;
  width: 100%;
  display: flex;
  flex-direction: column;
}

@media (min-width: 768px) {
  .editor-container {
    height: auto;
    border-right: 1px solid #ddd;
    border-bottom: none;
    width: 60%;
  }
  
  .right-panel {
    width: 40%;
    height: auto;
    min-width: 0; /* Allow shrinking */
  }
}

@media (min-width: 768px) {
  .editor-container {
    height: auto;
    border-right: 1px solid #ddd;
    border-bottom: none;
    width: 60%;
  }
}

/* Right panel container for output and hints */
@media (min-width: 768px) {
  .output-container, .hints-container {
    width: 40%;
  }
}

/* Output and Hints panels */
.output-container {
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
  border-bottom: 1px solid #ddd;
}

.hints-container {
  flex: 1;
  width: 100%;
  display: flex;
  flex-direction: column;
  background-color: #f9f9f9;
}

/* Remove the media query sizing since they're now inside right-panel */

.output-header {
  padding: 8px 12px;
  background-color: #e9e9e9;
  border-bottom: 1px solid #ddd;
  font-weight: bold;
}

.hints-header {
  padding: 8px 12px;
  background-color: #e9e9e9;
  border-bottom: 1px solid #ddd;
  font-weight: bold;
  color: #ff9800;
}

.output-content {
  flex: 1;
  margin: 0;
  padding: 12px;
  overflow: auto;
  white-space: pre-wrap;
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', 'Courier New', Courier, monospace;
  font-size: 14px;
}

.hints-content {
  flex: 1;
  margin: 0;
  padding: 12px;
  overflow: auto;
  white-space: pre-wrap;
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', 'Courier New', Courier, monospace;
  font-size: 14px;
  color: #333;
  line-height: 1.5;
}

/* CodeMirror specific styles */
.editor-container :deep(.cm-editor) {
  height: 100% !important;
}

/* Additional syntax highlighting support */
.editor-container :deep(.cm-editor .cm-content) {
  font-family: 'JetBrains Mono', 'Fira Code', 'Consolas', 'Courier New', monospace !important;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  .editor-header {
    background-color: #333;
    border-bottom-color: #555;
    color: #ddd;
  }
  
  .output-container {
    background-color: #2d2d2d;
    color: #ddd;
  }
  
  .hints-container {
    background-color: #252525;
    color: #ddd;
  }
  
  .output-header, .hints-header {
    background-color: #3a3a3a;
    border-bottom-color: #555;
    color: #ddd;
  }
  
  .hints-header {
    color: #ffb74d;
  }

  /* Dark mode syntax highlighting */
  .editor-container :deep(.cm-editor) {
    background-color: #1e1e1e !important;
    color: #d4d4d4 !important;
  }
  
  .editor-container :deep(.tok-keyword) { 
    color: #569cd6 !important;
  }
  
  .editor-container :deep(.tok-string) { 
    color: #ce9178 !important;
  }
  
  .editor-container :deep(.tok-comment) { 
    color: #6a9955 !important;
  }
  
  .editor-container :deep(.tok-number) { 
    color: #b5cea8 !important;
  }
  
  .editor-container :deep(.tok-function) { 
    color: #dcdcaa !important;
  }
  
  .editor-container :deep(.tok-variableName) { 
    color: #9cdcfe !important;
  }
}
</style>