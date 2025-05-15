import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  ElementRef,
  AfterViewInit, TemplateRef,
} from "@angular/core";
import * as prism from "prismjs";
import { ParsrService } from "../../../service/parsr.service";
import { MarkdownService } from "../../../service/markdown.service";
import {MatDialog} from "@angular/material/dialog";
import * as mammoth from "mammoth";

@Component({
  selector: "app-submission-code",
  templateUrl: "./submission-code.component.html",
  styleUrls: ["./submission-code.component.scss"],
})
export class SubmissionCodeComponent implements OnInit, AfterViewInit {
  toSubmit = "";
  highlightedText = "";
  @Input() title?: string;
  @Output() update: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild("fileInput", { static: false }) fileInput!: ElementRef;
  @ViewChild("errorDialog") errorDialogTemplate!: TemplateRef<any>;
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

  constructor(
    private parsrService: ParsrService,
    private markdownService: MarkdownService,
    private dialog: MatDialog
  ) {}

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

  async processFile(file: File, includeImages = false) {
    this.processing = true;
    const fileType = file.name.split(".").pop()?.toLowerCase();

    try {
      if (fileType === "pdf") {
        this.toSubmit = await this.extractPdfText(file, includeImages);
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
      this.dialog.open(this.errorDialogTemplate, {
        data: { message: "Fehler beim Verarbeiten der Datei: " + error.message },
      });
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

  async extractPdfText(file: File, includeImages = false): Promise<string> {
    return new Promise((resolve, reject) => {
      this.parsrService.uploadFile(file).subscribe({
        next: async (jobId) => {
          try {
            const markdown = await this.parsrService
              .getMarkdown(jobId, includeImages)
              .toPromise();
            if (typeof markdown === "object") {
              throw markdown;
            }
            const html = this.markdownService.parseToString(markdown);
            resolve(html);
          } catch (err) {
            reject(err);
          }
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

  downloadSubmission() {
    let filename = "abgabe";
    let mimeType = "text/plain;charset=utf-8";

    const looksLikeHtml = /<[a-z][\s\S]*>/i.test(this.toSubmit);

    if (looksLikeHtml && !this.isCodeFile) {
      filename += ".html";
      mimeType = "text/html;charset=utf-8";

      if (!this.toSubmit.trim().startsWith("<!DOCTYPE")) {
        this.toSubmit = `<!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Abgabe</title>
    </head>
    <body>
    ${this.toSubmit}
    </body>
    </html>`;
      }
    } else if (this.isCodeFile) {
      const detectedType = this.detectFileType();
      filename += "." + detectedType;
    } else {
      filename += ".txt";
    }

    const blob = new Blob([this.toSubmit], { type: mimeType });
    const url = window.URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }
}
