from pathlib import Path
from pypdf import PdfReader

root = Path('docs')
out = root / '_extracted'
out.mkdir(exist_ok=True)

for pdf in root.glob('*.pdf'):
    reader = PdfReader(str(pdf))
    text_parts = []
    for i, p in enumerate(reader.pages):
        try:
            t = p.extract_text() or ''
        except Exception as e:
            t = f"\n[ERROR page {i+1}: {e}]\n"
        text_parts.append(f"\n\n===== PAGE {i+1} =====\n\n{t}")
    out_file = out / (pdf.stem + '.txt')
    out_file.write_text(''.join(text_parts), encoding='utf-8', errors='ignore')
    print(f"{pdf.name} -> {out_file} ({len(reader.pages)} pages)")
