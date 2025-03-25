import { Component, EventEmitter, Input, OnInit, Output, ViewChild, ElementRef } from "@angular/core";
import * as pdfjsLib from "pdfjs-dist";
import * as mammoth from "mammoth";
import { AngularEditorConfig } from '@kolkov/angular-editor';

@Component({
  selector: "app-submission-text",
  templateUrl: "./submission-text.component.html",
  styleUrls: ["./submission-text.component.scss"],
})
export class SubmissionTextComponent implements OnInit {
  toSubmit = "";
  @Input() title?: string;
  @Output() update: EventEmitter<any> = new EventEmitter<any>();

  @ViewChild("fileInput", { static: false }) fileInput!: ElementRef;

  processing: boolean = false; // Ladesymbol steuern
  titleText: string = "Abgabe Text:";

  constructor() {
    // Setze den Worker-Pfad für PDF.js
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js"; // oder den lokalen Pfad verwenden
  }

  ngOnInit() {
    if (this.title != null) {
      this.titleText = this.title;
    }
  }

  
  editorConfig = {
    editable: true,
    spellcheck: true,
    height: '200px',
    minHeight: '150px',
    placeholder: 'Schreibe hier deine Lösung...',
    translate: 'no',
    toolbarHiddenButtons: [[], []],
  };

  stripHtml(content: string) {
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
    const fileType = file.name.split(".").pop()?.toLowerCase();

    try {
      if (fileType === "pdf") {
        this.toSubmit = await this.extractPdfText(file);
      } else if (fileType === "docx") {
        this.toSubmit = await this.extractWordText(file);
      } else if (fileType === "txt" || this.isCodeFile(fileType)) {
        this.toSubmit = await this.extractPlainText(file);
      } else {
        throw new Error("Dateityp nicht unterstützt.");
      }
    } catch (error) {
      console.error("Fehler bei der Datei-Extraktion:", error);
      alert("Fehler beim Verarbeiten der Datei: " + error.message);
    } finally {
      this.processing = false;
    }
  }

  // Prüft, ob die Datei eine Code-Datei ist
  isCodeFile(fileType: string | undefined): boolean {
    const codeExtensions = ["js", "ts", "html", "css", "py", "java", "cpp", "c", "go", "rb", "php"];
    return codeExtensions.includes(fileType || "");
  }

  async extractPdfText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);

      reader.onload = () => {
        const arrayBuffer = reader.result as ArrayBuffer;

        try {
          // Umwandlung von ArrayBuffer zu Uint8Array
          const uint8Array = new Uint8Array(arrayBuffer);

          const loadingTask = pdfjsLib.getDocument({ data: uint8Array });

          loadingTask.promise
            .then((pdf) => {
              let text = "";
              const numPages = pdf.numPages;

              const getTextFromPage = async (pageNum: number) => {
                const page = await pdf.getPage(pageNum);
                const content = await page.getTextContent();

                // Hier füge Leerzeichen und Absätze hinzu
                const pageText = content.items
                  .map((item: any) => {
                    if (item.str === "\n") {
                      return "\n"; // Zeilenumbruch beibehalten
                    }
                    return item.str + " "; // Zwischen den Textteilen Leerzeichen einfügen
                  })
                  .join("");

                text += pageText;
              };

              const processPages = async () => {
                for (let i = 1; i <= numPages; i++) {
                  await getTextFromPage(i);
                }
                resolve(text); // Text zurückgeben, wenn alle Seiten verarbeitet sind
              };

              processPages().catch(reject);
            })
            .catch((error) => {
              reject(new Error("Fehler beim Verarbeiten der PDF: " + error.message));
            });
        } catch (error) {
          reject(new Error("Fehler beim Verarbeiten der Datei: " + error.message));
        }
      };

      reader.onerror = () => {
        reject(new Error("Fehler beim Lesen der Datei."));
      };
    });
  }


  async extractWordText(file: File): Promise<string> {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = async () => {
        const arrayBuffer = reader.result as ArrayBuffer;
        const result = await mammoth.extractRawText({ arrayBuffer });
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
}
