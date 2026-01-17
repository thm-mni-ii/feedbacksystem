import base64
import binascii
import io
import os
import re
import logging
from pathlib import Path
import fitz

logging.basicConfig(level=logging.INFO)


def pdf_bytes_from_base64(b64_string: str) -> bytes:
    s = (b64_string or "").strip()
    if s.startswith("data:"):
        s = s.split(",", 1)[1] if "," in s else ""
    s = re.sub(r"\s+", "", s).replace("-", "+").replace("_", "/")
    missing = (4 - (len(s) % 4)) % 4
    if missing:
        s += "=" * missing
    try:
        data = base64.b64decode(s, validate=False)
    except binascii.Error as e:
        raise ValueError(f"Ungültiges Base64: {e}")
    if not data:
        raise ValueError("Leeres PDF nach Base64-Decode (0 Bytes).")
    return data


def extract_images_with_fitz_bytes(pdf_bytes: bytes, out_dir: str):
    Path(out_dir).mkdir(parents=True, exist_ok=True)
    collected = []
    image_count = 0

    with fitz.open(stream=pdf_bytes, filetype="pdf") as doc:
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

    logging.info(f"Gesamtanzahl der extrahierten Bilder: {image_count}")
    return collected


def extract_text_and_embed_bytes(pdf_bytes: bytes, collected_images):
    md_lines = []
    imgs_by_page = {}
    for pg, y0, tag, _ in collected_images:
        imgs_by_page.setdefault(pg, []).append((y0, tag))
    for img_list in imgs_by_page.values():
        img_list.sort(key=lambda x: x[0])

    with fitz.open(stream=pdf_bytes, filetype="pdf") as doc:
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

    return "\n".join(md_lines)


def extract_tasks_from_markdown(full_md: str):
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
        tasks.append({"title": clean_title, "content": cleaned, "images": images})
    return tasks
