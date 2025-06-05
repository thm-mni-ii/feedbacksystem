<template>
  <div class="editor-fullscreen">
    <div class="editor-header">
      <button @click="runCode" class="run-button" :disabled="isRunning">
        {{ isRunning ? 'Running...' : 'Run Code' }}
      </button>
      <button @click="saveCode" class="save-button" :disabled="isRunning">
        {{ 'Save' }}
      </button>
    </div>
    <div class="editor-layout">
      <div ref="editorContainer" class="editor-container"></div>
      <div class="output-container">
        <div class="output-header">Output</div>
        <pre ref="outputContainer" class="output-content">{{ output }}</pre>
      </div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { EditorView } from '@codemirror/view'
import { EditorState } from '@codemirror/state'
import { basicSetup } from 'codemirror'
import { python } from '@codemirror/lang-python'
import storeService from './services/storeService'
import codeService from './services/codeService'

const editorContainer = ref(null)
const outputContainer = ref(null)
const output = ref('')
const isRunning = ref(false)
let editorView = null

onMounted(async () => {
  // Initialize editor
  const state = EditorState.create({
    doc: await getCode(),
    extensions: [
      basicSetup,
      python(),
      EditorView.theme({
        "&": {
          height: "100%",
          width: "100%"
        },
        ".cm-scroller": {
          overflow: "auto"
        },
        ".cm-content, .cm-gutter": {
          minHeight: "100%"
        }
      })
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
const getCode = async () => {
  const response = await storeService.getCodeFromTask(1)
  const code = response.data.text
  console.log(code)
  console.log(code)
  console.log(code)
  console.log(code)
  console.log(code)
  if(code === "" || code === undefined) {
    console.log("HEUL DOCH");
    return `# Python-Beispielcode
      x = 3
      print(f"{x} ist gleich 3")`
  }
  return code;
}

const runCode = async () => {
  isRunning.value = true
  output.value = "Running...\n"
  const resp = await codeService.executeCode("1", await getCode())
  console.log(resp);
  output.value = resp;
}

onBeforeUnmount(() => {
  if (editorView) editorView.destroy()
})
</script>
<style>
/* Base styles */
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.editor-fullscreen {
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
}

/* Header with run button */
.editor-header {
  padding: 8px 12px;
  background-color: #f0f0f0;
  border-bottom: 1px solid #ddd;
  display: flex;
  align-items: center;
}

.save-button {
  background-color: royalblue;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  font-weight: bold;
  margin-left: 8px;
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

.status-indicator {
  margin-left: 12px;
  font-size: 14px;
  color: #666;
}

.status-indicator.running {
  color: #ff9800;
}

/* Layout for editor and output */
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

.editor-container {
  flex: 1;
  height: 50%;
  min-height: 200px;
  border-bottom: 1px solid #ddd;
}

@media (min-width: 768px) {
  .editor-container {
    height: auto;
    border-right: 1px solid #ddd;
    border-bottom: none;
  }
}

/* Output panel */
.output-container {
  height: 50%;
  display: flex;
  flex-direction: column;
  background-color: #f5f5f5;
}

@media (min-width: 768px) {
  .output-container {
    width: 40%;
    min-width: 300px;
    height: auto;
  }
}

.output-header {
  padding: 8px 12px;
  background-color: #e9e9e9;
  border-bottom: 1px solid #ddd;
  font-weight: bold;
}

.output-content {
  flex: 1;
  margin: 0;
  padding: 12px;
  overflow: auto;
  white-space: pre-wrap;
  font-family: 'Courier New', Courier, monospace;
  font-size: 14px;
}

/* CodeMirror specific styles */
.cm-editor {
  height: 100% !important;
}

:root {
  --cm-background: #f8f9fa;
  --cm-gutters: #eaecef;
}

/* Dark mode support */
@media (prefers-color-scheme: dark) {
  :root {
    --cm-background: #1e1e1e;
    --cm-gutters: #252526;
  }
  
  .editor-header {
    background-color: #333;
    border-bottom-color: #555;
  }
  
  .status-indicator {
    color: #bbb;
  }
  
  .output-container {
    background-color: #2d2d2d;
    color: #ddd;
  }
  
  .output-header {
    background-color: #3a3a3a;
    border-bottom-color: #555;
    color: #ddd;
  }
}
</style>

