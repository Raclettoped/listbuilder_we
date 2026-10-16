import fitz  # pymupdf
import sys, json

def extract_text(pdf_path):
    doc = fitz.open(pdf_path)
    pages = []
    for i, page in enumerate(doc):
        text = page.get_text("text")  # native text extraction
        pages.append({"page": i + 1, "text": text})
    doc.close()
    return pages

if __name__ == "__main__":
    pages = extract_text(sys.argv[1])
    with open("extracted.json", "w") as f:
        json.dump(pages, f, indent=2)
    print(f"Extracted {len(pages)} pages to extracted.json")
