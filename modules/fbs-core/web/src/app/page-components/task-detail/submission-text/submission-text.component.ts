import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  ElementRef,
  AfterViewInit,
  TemplateRef,
} from "@angular/core";
import * as prism from "prismjs";
import { ParsrService } from "../../../service/parsr.service";
import { MarkdownService } from "../../../service/markdown.service";
import { MatDialog } from "@angular/material/dialog";
import * as mammoth from "mammoth";

export type SubmissionMode = "code" | "wysiwyg" | "plain" | "free";

@Component({
  selector: "app-submission-text",
  templateUrl: "./submission-text.component.html",
  styleUrls: ["./submission-text.component.scss"],
})
export class SubmissionTextComponent implements OnInit, AfterViewInit {
  toSubmit = "";
  highlightedText = "";

  @Input() title?: string;
  @Input() mode: SubmissionMode = "free";
  @Output() update: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild("fileInput", { static: false }) fileInput!: ElementRef;
  @ViewChild("errorDialog") errorDialogTemplate!: TemplateRef<any>;
  @ViewChild("codeBlock", { static: false }) codeBlock!: ElementRef;

  processing: boolean = false;
  titleText: string = "Abgabe Text:";
  isCodeFile: boolean = false;
  fileType: string = "txt";
  currentMode: SubmissionMode = "plain";

  extractionMode: "text" | "all" = "text";
  detectedFileType = "markup";

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

    this.currentMode = this.mode;

    if (this.mode === "code") {
      this.isCodeFile = true;
    } else if (this.mode === "wysiwyg" || this.mode === "plain") {
      this.isCodeFile = false;
    }

    this.parsrService.testConnection().subscribe({
      error: (err) => {
        console.error("Backend nicht erreichbar:", err.message);
      },
    });
  }

  ngAfterViewInit() {
    this.highlightCode();
  }

  switchToMode(newMode: SubmissionMode) {
    if (newMode === "code") {
      this.isCodeFile = true;
    } else {
      if (this.isCodeFile && (newMode === "wysiwyg" || newMode === "plain")) {
        // When switching from code to text editor: format HTML
        const beautified = this.beautifyHtml(this.toSubmit);
        this.toSubmit = this.decodeHtmlEntities(beautified);
      }
      this.isCodeFile = false;
    }
    this.currentMode = newMode;
    this.highlightCode();
  }

  toggleEditor() {
    if (this.currentMode === "code") {
      this.switchToMode("wysiwyg");
    } else {
      this.switchToMode("code");
    }
  }

  onExtractOptionSelected(mode: "text" | "all") {
    this.extractionMode = mode;
    this.fileInput.nativeElement.value = null;
    this.fileInput.nativeElement.click();
  }

  uploadFile() {
    this.fileInput.nativeElement.click();
  }

  decodeHtmlEntities(html: string): string {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = html;
    return textarea.value;
  }

  beautifyHtml(html: string): string {
    return (
      html
        // Neue Zeile vor bestimmten HTML-Tags
        .replace(
          /<(\/?(p|h[1-6]|li|div|table|tr|td|section|article|header|footer|ul|ol))\b/g,
          "\n<$1"
        )
        // Zeilenumbruch vor Attributen wie class, src, alt, style
        .replace(
          /(<[^>]+?)\s+(class|src|alt|style|href|id|name|data-[^=]+)=/g,
          "\n  $1\n  $2="
        )
        // Mehrfache Zeilenumbrüche auf nur einen reduzieren
        .replace(/\n{2,}/g, "\n")
        // Überflüssige Leerzeichen entfernen
        .trim()
    );
  }

  formatHtml(html: string): string {
    const parser = new DOMParser();
    const document = parser.parseFromString(html, "text/html");
    return document.body.innerHTML;
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
      json: "json",
    };
    return languages[fileType] || "javascript";
  }

  detectFileType(): string {
    const htmlIndicators = [
      "<html",
      "<head",
      "<body",
      "<div",
      "<p",
      "<h1",
      "<table",
      "<!DOCTYPE",
    ];
    const lowerContent = this.toSubmit.toLowerCase();

    if (htmlIndicators.some((tag) => lowerContent.includes(tag))) {
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

  highlightCode(fileType?: string) {
    if (this.toSubmit && this.isCodeFile) {
      const detectedFileType = fileType || this.detectFileType();
      this.detectedFileType = detectedFileType;
      const language = this.getLanguageByFileType(detectedFileType);

      let content = this.toSubmit;
      if (language === "markup") {
        content = this.formatHtml(content);
      }

      if (prism.languages[language]) {
        this.highlightedText = prism.highlight(
          content,
          prism.languages[language],
          language
        );

        // Update code block if it exists
        if (this.codeBlock) {
          this.codeBlock.nativeElement.innerHTML = this.highlightedText;
        }
      } else {
        console.warn(
          "Keine passende Sprache für Prism gefunden:",
          detectedFileType
        );
      }
    }
  }

  updateSubmission(content: string) {
    this.toSubmit = content;
    this.detectedFileType = this.detectFileType();
    this.update.emit({ content: this.toSubmit });
    this.highlightCode();
  }

  onTextChange(content: string) {
    this.toSubmit = content;
    this.detectedFileType = this.detectFileType();
    this.update.emit({ content: this.toSubmit });
    this.highlightCode();
  }

  onCodeChange(content: string) {
    this.toSubmit = content;
    this.detectedFileType = this.detectFileType();
    this.update.emit({ content: this.toSubmit });
    this.highlightCode(this.detectedFileType);
  }

  handleFileInput(event: any) {
    const file = event.target.files[0];
    if (file) {
      const includeImages = this.extractionMode === "all";
      this.processFile(file, includeImages);
    }
  }

  async processFile(file: File, includeImages = false) {
    this.processing = true;
    this.fileType = file.name.split(".").pop()?.toLowerCase() || "txt";

    try {
      if (this.fileType === "pdf") {
        this.toSubmit = await this.extractPdfText(file, includeImages);
        if (this.currentMode === "free") {
          this.switchToMode("wysiwyg");
        }
        this.fileType = "html";
      } else if (this.fileType === "docx") {
        this.toSubmit = await this.extractWordText(file, includeImages);
        this.toSubmit = this.beautifyHtml(this.toSubmit);
        if (this.currentMode === "free") {
          this.switchToMode("wysiwyg");
        }
        this.fileType = "html";
      } else if (
        this.fileType === "txt" ||
        this.checkIfCodeFile(this.fileType)
      ) {
        this.toSubmit = await this.extractPlainText(file);
        const isCode = this.checkIfCodeFile(this.fileType);
        if (this.currentMode === "free") {
          this.switchToMode(isCode ? "code" : "plain");
        }
      } else {
        throw new Error("Dateityp nicht unterstützt.");
      }
    } catch (error: any) {
      const errorMsg =
        error?.message && typeof error.message === "string"
          ? error.message
          : "Die Datei hat zu viele Seiten oder ist zu groß.";
      this.dialog.open(this.errorDialogTemplate, {
        data: {
          message: "Fehler beim Verarbeiten der Datei: " + errorMsg,
        },
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
      "json",
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
              reject(markdown);
              return;
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

  async extractWordText(file: File, includeImages = false): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = async () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        const result = await mammoth.convertToHtml({ arrayBuffer });

        let html = result.value;
        if (!includeImages) {
          // Nur die Bildinformationen beibehalten (alt/src), aber nicht das volle <img>-Tag
          html = html.replace(
            /<img[^>]*src="([^"]+)"[^>]*>/g,
            (_match, src) => {
              const fileName = src.split("/").pop(); // extrahiert nur den Dateinamen
              return `<p>[Bild: ${fileName}]</p>`;
            }
          );
        }
        resolve(html);
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

  get showModeSelector(): boolean {
    return this.mode === "free";
  }

  get showToggleButton(): boolean {
    return this.mode === "free";
  }

  get showExtractMenu(): boolean {
    return this.currentMode !== "code";
  }

  get acceptedFileTypes(): string {
    if (this.currentMode === "code") {
      return ".pdf,.docx,.txt,.java,.ts,.js,.py,.cpp,.c,.go,.rb,.php,.html,.css";
    }
    return ".pdf,.docx,.txt,.java,.ts,.js,.py";
  }
}
