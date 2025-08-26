import base64
import os
import re
import json
import time
import logging
from pathlib import Path
import fitz

logging.basicConfig(level=logging.INFO)


def extract_images_with_fitz(pdf_path, out_dir):
    doc = fitz.open(pdf_path)
    collected = []
    image_count = 0

    for pno in range(len(doc)):
        pg = pno + 1
        page = doc[pno]
        img_list = page.get_images(full=True)
        img_pos = []

        for img in img_list:
            xref = img[0]
            rects = page.get_image_rects(xref)
            if not rects:
                continue
            y0 = rects[0].y0
            img_pos.append((pg, y0, xref))

        img_pos.sort(key=lambda x: x[1])
        for idx, (pg, y0, xref) in enumerate(img_pos, start=1):
            meta = doc.extract_image(xref)
            data = meta["image"]
            ext = meta["ext"]
            fname = os.path.join(out_dir, f"image_page{pg}_{idx}.{ext}")
            with open(fname, "wb") as f:
                f.write(data)
            b64 = base64.b64encode(data).decode("ascii")
            tag = f"![Seite {pg}](data:image/{ext};base64,{b64})"
            collected.append((pg, y0, tag, fname))

            image_count += 1
    doc.close()
    logging.info(f"Gesamtanzahl der extrahierten Bilder: {image_count}")
    return collected


def extract_text_and_embed(pdf_path, collected_images):
    doc = fitz.open(pdf_path)
    md_lines = []

    imgs_by_page = {}
    for pg, y0, tag, _ in collected_images:
        imgs_by_page.setdefault(pg, []).append((y0, tag))
    for img_list in imgs_by_page.values():
        img_list.sort(key=lambda x: x[0])

    for pno in range(len(doc)):
        pg = pno + 1
        page = doc[pno]
        img_queue = imgs_by_page.get(pg, [])
        img_idx = 0

        blocks = sorted(page.get_text("dict")["blocks"], key=lambda b: b["bbox"][1])
        for b in blocks:
            if b["type"] != 0:
                continue
            for line in b["lines"]:
                text = "".join(span["text"] for span in line["spans"]).rstrip()
                if not text:
                    continue
                if text.lstrip().startswith(("•", "–", "-")) or text.startswith(("  ", "\t")):
                    clean = text.lstrip("•–- \t")
                    md_lines.append(f"- {clean}")
                else:
                    md_lines.append(text)

            block_y = b["bbox"][1]
            while img_idx < len(img_queue) and img_queue[img_idx][0] <= block_y:
                md_lines.append("")
                md_lines.append(img_queue[img_idx][1])
                md_lines.append("")
                img_idx += 1

        while img_idx < len(img_queue):
            md_lines.append("")
            md_lines.append(img_queue[img_idx][1])
            md_lines.append("")
            img_idx += 1

        md_lines.append("\n---\n")

    doc.close()
    return "\n".join(md_lines)

def extract_tasks_from_markdown(full_md):
    pattern = re.compile(r'''(?msx)
        ^[ \t]*
        (?:✓[ \t]*)?
        (?:\d+(?:\.\d+)*[ \t]+)?
        (
          (?:Aufgabe|Abgabe)\s+\d+(?:-\d+)*  
          (?:\s*\(\d+\s*Pkt\.\))?            
        )
        :?
        [ \t]*\r?\n
        (.*?)(?=
           ^[ \t]*(?:✓[ \t]*)?
           (?:\d+(?:\.\d+)*[ \t]+)?
           (?:Aufgabe|Abgabe)\s+\d+(?:-\d+)* 
           (?:\s*\(\d+\s*Pkt\.\))?
           :?
           [ \t]*\r?\n
         | \Z)
    ''')
    tasks = []
    for title, content in pattern.findall(full_md):
        clean_title = title.strip()
        images = re.findall(r'!\[.*?\]\(data:image/.*?\)', content)
        cleaned = re.sub(r'!\[.*?\]\(data:image/.*?\)', '', content)
        cleaned = re.sub(r'\n{3,}', '\n\n', cleaned).strip()
        cleaned = cleaned.split('\n******')[0].strip()
        tasks.append({
            "title": clean_title,
            "content": cleaned,
            "images": images
        })
    return tasks

def main():
    start = time.time()
    pdf_path = "./tmpfiles/test1.pdf"
    out_dir = Path("output")
    img_dir = out_dir / "images"
    os.makedirs(img_dir, exist_ok=True)

    collected_images = extract_images_with_fitz(pdf_path, str(img_dir))
    markdown = extract_text_and_embed(pdf_path, collected_images)
    tasks = extract_tasks_from_markdown(markdown)

    with open(out_dir / "output.json", "w", encoding="utf-8") as f:
        json.dump(tasks, f, ensure_ascii=False, indent=2)

    with open(out_dir / "output.md", "w", encoding="utf-8") as f:
        f.write(markdown)

    logging.info(f"Fertig in {time.time()-start:.2f}s")

if __name__ == "__main__":
    main()