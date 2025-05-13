import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  ElementRef,
} from "@angular/core";
import { ParsrService } from "../../../service/parsr.service";
import { MarkdownService } from "../../../service/markdown.service";

@Component({
  selector: "app-submission-code",
  templateUrl: "./submission-code.component.html",
  styleUrls: ["./submission-code.component.scss"],
})
export class SubmissionCodeComponent implements OnInit {
  toSubmit = "";
  @Input() title?: string;
  @Output() update: EventEmitter<any> = new EventEmitter<any>();
  @ViewChild("fileInput", { static: false }) fileInput!: ElementRef;
  processing: boolean = false;
  titleText: string = "Abgabe Code:";
  fileType: string = "txt";

  constructor(
    private parsrService: ParsrService,
    private markdownService: MarkdownService
  ) {}

  ngOnInit() {
    if (this.title != null) {
      this.titleText = this.title;
    }
    this.parsrService.testConnection().subscribe({
      next: (res) => console.log("✅ Backend antwortet:", res),
      error: (err) =>
        console.error("❌ Backend nicht erreichbar:", err.message),
    });
  }
  getLanguageByFileType(fileType: string): string {
    const languages: { [key: string]: string } = {
      js: "javascript",
      ts: "typescript",
      html: "markup",
      css: "css",
      py: "python",
      java: "java",
      cpp: "cpp",
      rb: "ruby",
      php: "php",
      c: "c",
      go: "go",
    };
    return languages[fileType] || "javascript";
  }

  onCodeChange(content: string) {
    this.toSubmit = content;
    this.update.emit({ content: this.toSubmit });
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
    this.fileType = file.name.split(".").pop()?.toLowerCase() || "txt";
    try {
      if (this.fileType === "pdf") {
        this.toSubmit = await this.extractPdfText(file);
      } else if (this.fileType === "docx") {
        this.toSubmit = await this.extractWordText(file);
      } else if (
        this.fileType === "txt" ||
        this.checkIfCodeFile(this.fileType)
      ) {
        this.toSubmit = await this.extractPlainText(file);
      } else {
        throw new Error("Dateityp nicht unterstützt.");
      }
    } catch (error: any) {
      console.error("Fehler bei der Datei-Extraktion:", error);
      alert("Fehler beim Verarbeiten der Datei: " + error.message);
    } finally {
      this.processing = false;
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

  async extractPdfText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      this.parsrService.uploadFile(file).subscribe({
        next: async (jobId) => {
          try {
            const markdown = await this.parsrService
              .getMarkdown(jobId)
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
        const result = await (window as any).mammoth.convertToHtml({
          arrayBuffer,
        });
        resolve(result.value);
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
    let detectedType = this.fileType || "txt";
    filename += "." + detectedType;
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
