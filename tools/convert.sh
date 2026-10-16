#!/usr/bin/env bash
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PDFDIR="$ROOT/pdf_armies"
TXTDIR="$ROOT/txt_armies"
OUTDIR="$ROOT/src/data/armies"

mkdir -p "$TXTDIR" "$OUTDIR"

shopt -s nullglob
pdfs=("$PDFDIR"/*.pdf)
if (( ${#pdfs[@]} == 0 )); then
    echo "No PDFs in $PDFDIR"
    exit 1
fi

if [[ -z "${VIRTUAL_ENV:-}" && -f "$ROOT/venv/bin/activate" ]]; then
    # shellcheck disable=SC1091
    source "$ROOT/venv/bin/activate"
fi

echo "Found ${#pdfs[@]} PDFs."
echo

for pdf in "${pdfs[@]}"; do
    base=$(basename "$pdf" .pdf)
    txt="$TXTDIR/$base.txt"
    out="$OUTDIR/$base.json"

    echo "==> $base"
    if [[ -f "$out" ]]; then
        echo "  ↷ $out exists, skipping"
        continue
    fi
    if [[ ! -f "$txt" ]]; then
        pdftotext -layout "$pdf" "$txt" || { echo "  ✗ pdftotext failed"; continue; }
    fi
    python "$ROOT/tools/txt2json.py" "$txt" "$out" || echo "  ✗ conversion failed"
    echo
done

echo "Done. Output in $OUTDIR"
