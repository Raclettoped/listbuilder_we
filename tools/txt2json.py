#!/usr/bin/env python3
"""Convert a pdftotext-extracted warband .txt into RawWarband JSON via Ollama."""
import json, re, sys
from pathlib import Path
import ollama

MODEL = "qwen3.5:latest"
ROOT = Path(__file__).resolve().parent.parent
PROMPT_FILE = ROOT / "tools" / "schema_prompt.txt"


def call_ollama(prompt: str) -> str:
    resp = ollama.generate(
        model=MODEL,
        prompt=prompt,
        think=False,
        format="json",
        options={
            "temperature": 0.1,
            "num_ctx": 16384,
            "num_predict": 12288,
        },
    )
    return resp["response"]


def validate(data: dict) -> list[str]:
    errs = []
    if not isinstance(data.get("warband"), str):
        errs.append("missing/invalid 'warband'")
    if not isinstance(data.get("units"), list) or not data["units"]:
        errs.append("missing/empty 'units'")
    for i, u in enumerate(data.get("units", [])):
        if not isinstance(u.get("name"), str):
            errs.append(f"units[{i}].name missing")
    return errs


def main(txt_path: Path, out_path: Path) -> None:
    template = PROMPT_FILE.read_text()
    text = txt_path.read_text(errors="replace")
    prompt = template.replace("<<<SOURCE>>>", text)

    raw = call_ollama(prompt)
    raw = re.sub(r"^```(?:json)?\s*|\s*```$", "", raw.strip())

    try:
        data = json.loads(raw)
    except json.JSONDecodeError as e:
        bad = out_path.with_suffix(".bad.txt")
        bad.write_text(raw)
        print(f"  ✗ invalid JSON ({e}) — raw saved to {bad.name}", file=sys.stderr)
        sys.exit(1)

    errs = validate(data)
    if errs:
        bad = out_path.with_suffix(".bad.txt")
        bad.write_text(raw)
        print(f"  ✗ validation: {errs} — raw saved to {bad.name}", file=sys.stderr)
        sys.exit(1)

    out_path.write_text(json.dumps(data, indent=2, ensure_ascii=False))
    print(f"  ✓ {out_path.name}  ({len(data['units'])} units)")


if __name__ == "__main__":
    main(Path(sys.argv[1]), Path(sys.argv[2]))
