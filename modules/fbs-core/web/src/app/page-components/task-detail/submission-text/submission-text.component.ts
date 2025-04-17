import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  ElementRef,
  AfterViewInit,
} from "@angular/core";
import * as mammoth from "mammoth";
import * as prism from "prismjs";
import { ParsrService } from "../../../service/parsr.service";

@Component({
  selector: "app-submission-text",
  templateUrl: "./submission-text.component.html",
  styleUrls: ["./submission-text.component.scss"],
})
export class SubmissionTextComponent implements OnInit, AfterViewInit {
  toSubmit = "";
  highlightedText = "";
  @Input() title?: string;
  @Output() update: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild("fileInput", { static: false }) fileInput!: ElementRef;
  processing: boolean = false;
  titleText: string = "Abgabe Text:";
  isCodeFile: boolean = false;

  editorConfig = {
    editable: true,
    spellcheck: true,
    height: "200px",
    minHeight: "150px",
    placeholder: "Schreibe hier deine Lösung...",
    translate: "no",
    toolbarHiddenButtons: [[], []],
  };

  constructor(private parsrService: ParsrService) {}

  ngOnInit() {
    if (this.title != null) {
      this.titleText = this.title;
    }

    // Backend-Test beim Laden
    this.parsrService.testConnection().subscribe({
      next: (res) => console.log("✅ Backend antwortet:", res),
      error: (err) =>
        console.error("❌ Backend nicht erreichbar:", err.message),
    });
  }

  ngAfterViewInit() {
    this.highlightCode();
  }

  toggleEditor() {
    this.isCodeFile = !this.isCodeFile;
  }

  getLanguageByFileType(fileType: string): string {
    const languages: { [key: string]: string } = {
      js: "javascript",
      ts: "typescript",
      html: "markup",
      css: "css",
      python: "python",
      java: "java",
      cpp: "cpp",
      ruby: "ruby",
      php: "php",
    };
    return languages[fileType] || "javascript";
  }

  onTextChange(content: string) {
    this.toSubmit = content;
    this.update.emit({ content: this.toSubmit });
    this.highlightCode();
  }

  onCodeChange(content: string) {
    this.toSubmit = content;
    this.update.emit({ content: this.toSubmit });
    this.highlightCode();
  }

  highlightCode(fileType?: string) {
    if (this.toSubmit && this.isCodeFile) {
      const detectedFileType = fileType || this.detectFileType();
      const language = this.getLanguageByFileType(detectedFileType);

      if (prism.languages[language]) {
        this.highlightedText = prism.highlight(
          this.toSubmit,
          prism.languages[language],
          language
        );
      } else {
        console.warn(
          "Keine passende Sprache für Prism gefunden:",
          detectedFileType
        );
      }
    }
  }

  detectFileType(): string {
    if (
      this.toSubmit.startsWith("<!DOCTYPE html") ||
      this.toSubmit.includes("<html>")
    ) {
      return "html";
    }
    if (this.toSubmit.includes("import") || this.toSubmit.includes("export")) {
      return "js";
    }
    if (
      this.toSubmit.includes("class") &&
      this.toSubmit.includes("public static void main")
    ) {
      return "java";
    }
    return "txt";
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
    const fileType = file.name.split(".").pop()?.toLowerCase();

    try {
      if (fileType === "pdf") {
        this.toSubmit = await this.extractPdfText(file);
        this.isCodeFile = false;
      } else if (fileType === "docx") {
        this.toSubmit = await this.extractWordText(file);
        this.isCodeFile = false;
      } else if (fileType === "txt" || this.checkIfCodeFile(fileType)) {
        this.toSubmit = await this.extractPlainText(file);
        this.isCodeFile = this.checkIfCodeFile(fileType);
      } else {
        throw new Error("Dateityp nicht unterstützt.");
      }
    } catch (error: any) {
      console.error("Fehler bei der Datei-Extraktion:", error);
      alert("Fehler beim Verarbeiten der Datei: " + error.message);
    } finally {
      this.processing = false;
      this.highlightCode();
      this.update.emit({ content: this.toSubmit });
    }
  }

  checkIfCodeFile(fileType: string | undefined): boolean {
    const codeExtensions = [
      "js",
      "ts",
      "html",
      "css",
      "py",
      "java",
      "cpp",
      "c",
      "go",
      "rb",
      "php",
    ];
    return codeExtensions.includes(fileType || "");
  }

  // In submission-text.component.ts
  async extractPdfText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      this.parsrService.uploadFile(file).subscribe({
        next: (jobId) => {
          const polling = setInterval(() => {
            this.parsrService.getMarkdown(jobId).subscribe({
              next: (markdown) => {
                clearInterval(polling);
                resolve(markdown);
              },
              error: (err) => {
                if (err.status !== 404) reject(err);
              },
            });
          }, 2000);
        },
        error: (err) => reject(err),
      });
    });
  }

  async extractWordText(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = async () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        const result = await mammoth.convertToHtml({ arrayBuffer });

        const htmlWithImages = result.value;

        resolve(htmlWithImages);
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
