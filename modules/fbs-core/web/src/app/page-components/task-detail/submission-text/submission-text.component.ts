import { Component, EventEmitter, Input, OnInit, Output, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import * as pdfjsLib from 'pdfjs-dist';
import * as mammoth from 'mammoth';
import * as prism from 'prismjs';

@Component({
  selector: 'app-submission-text',
  templateUrl: './submission-text.component.html',
  styleUrls: ['./submission-text.component.scss'],
})
export class SubmissionTextComponent implements OnInit, AfterViewInit {
  toSubmit = '';
  highlightedText = '';
  @Input() title?: string;
  @Output() update: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild('fileInput', { static: false }) fileInput!: ElementRef;
  processing: boolean = false;
  titleText: string = 'Abgabe Text:';
  isCodeFile: boolean = false;

  editorConfig = {
    editable: true,
    spellcheck: true,
    height: '200px',
    minHeight: '150px',
    placeholder: 'Schreibe hier deine Lösung...',
    translate: 'no',
    toolbarHiddenButtons: [[], []],
  };

  constructor() {
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'assets/pdfjs/pdf.worker.min.js';
  }

  ngOnInit() {
    if (this.title != null) {
      this.titleText = this.title;
    }
  }

  ngAfterViewInit() {
    this.highlightCode();
  }

  toggleEditor() {
    this.isCodeFile = !this.isCodeFile;
  }

  getLanguageByFileType(fileType: string): string {
    const languages: { [key: string]: string } = {
      js: 'javascript',
      ts: 'typescript',
      html: 'markup',
      css: 'css',
      python: 'python',
      java: 'java',
      cpp: 'cpp',
      ruby: 'ruby',
      php: 'php',
    };
    return languages[fileType] || 'javascript'; // Default-Sprache
  }

  onTextChange(content: string) {
    this.toSubmit = content;
    console.log("Aktueller Editor-Inhalt (Text):", this.toSubmit);
    this.update.emit({ content: this.toSubmit });
    this.highlightCode();
  }
  
  onCodeChange(content: string) {
    this.toSubmit = content;
    console.log("Aktueller Editor-Inhalt (Code):", this.toSubmit);
    this.update.emit({ content: this.toSubmit });
    this.highlightCode();
  }

  highlightCode(fileType?: string) {
    if (this.toSubmit && this.isCodeFile) {
      const detectedFileType = fileType || this.detectFileType(); 
      const language = this.getLanguageByFileType(detectedFileType);
      
      if (prism.languages[language]) {
        this.highlightedText = prism.highlight(this.toSubmit, prism.languages[language], language);
        console.log("Highlight Text:", this.highlightedText);
      } else {
        console.warn("Keine passende Sprache für Prism gefunden:", detectedFileType);
      }
    }
  }

  // Methode, um den Dateityp anhand des Inhalts zu erkennen
  detectFileType(): string {
    if (this.toSubmit.startsWith("<!DOCTYPE html") || this.toSubmit.includes("<html>")) {
      return "html";
    }
    if (this.toSubmit.includes("import") || this.toSubmit.includes("export")) {
      return "js"; 
    }
    if (this.toSubmit.includes("class") && this.toSubmit.includes("public static void main")) {
      return "java";
    }
    return "txt"; // Fallback
  }

  stripHtml(content: string) {
    this.toSubmit = content;
    this.update.emit({ content: this.toSubmit });
    this.highlightCode();
  }

  uploadFile() {
    this.fileInput.nativeElement.click();
  }

  handleFileInput(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.processFile(file);
    }
  }

  async processFile(file: File) {
    this.processing = true;
    const fileType = file.name.split('.').pop()?.toLowerCase();

    try {
      if (fileType === 'pdf') {
        this.toSubmit = await this.extractPdfText(file);
        this.isCodeFile = false;
      } else if (fileType === 'docx') {
        this.toSubmit = await this.extractWordText(file);
        this.isCodeFile = false;
      } else if (fileType === 'txt' || this.checkIfCodeFile(fileType)) {
        this.toSubmit = await this.extractPlainText(file);
        this.isCodeFile = this.checkIfCodeFile(fileType);
      } else {
        throw new Error('Dateityp nicht unterstützt.');
      }
    } catch (error) {
      console.error('Fehler bei der Datei-Extraktion:', error);
      alert('Fehler beim Verarbeiten der Datei: ' + error.message);
    } finally {
      this.processing = false;
      this.highlightCode(); 
      this.update.emit({ content: this.toSubmit });
    }
  }

  checkIfCodeFile(fileType: string | undefined): boolean {
    const codeExtensions = ['js', 'ts', 'html', 'css', 'py', 'java', 'cpp', 'c', 'go', 'rb', 'php'];
    return codeExtensions.includes(fileType || '');
  }

  async extractPdfText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);

      reader.onload = () => {
        const arrayBuffer = reader.result as ArrayBuffer;

        try {
          const uint8Array = new Uint8Array(arrayBuffer);

          const loadingTask = pdfjsLib.getDocument({ data: uint8Array });

          loadingTask.promise
            .then((pdf) => {
              let text = '';
              const numPages = pdf.numPages;

              const getTextFromPage = async (pageNum: number) => {
                const page = await pdf.getPage(pageNum);
                const content = await page.getTextContent();

                const pageText = content.items
                  .map((item: any) => {
                    if (item.str === '\n') {
                      return '\n';
                    }
                    return item.str + ' ';
                  })
                  .join(' ');

                text += pageText;
              };

              const processPages = async () => {
                for (let i = 1; i <= numPages; i++) {
                  await getTextFromPage(i);
                }
                resolve(text);
              };

              processPages().catch(reject);
            })
            .catch((error) => {
              reject(new Error('Fehler beim Verarbeiten der PDF: ' + error.message));
            });
        } catch (error) {
          reject(new Error('Fehler beim Verarbeiten der Datei: ' + error.message));
        }
      };

      reader.onerror = () => {
        reject(new Error('Fehler beim Lesen der Datei.'));
      };
    });
  }

  async extractWordText(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = async () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        const result = await mammoth.convertToHtml({ arrayBuffer });
  
        // Bilder entfernen 
        const cleanedHtml = result.value.replace(/<img[^>]*>/g, "");
  
        resolve(cleanedHtml);
      };
    });
  } 

  async extractPlainText(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsText(file);
      reader.onload = () => {
        resolve(reader.result as string);
      };
    });
  }
}
