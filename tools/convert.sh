#!/usr/bin/env bash
set -uo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TODO="$ROOT/pdf_todo"
DONE="$ROOT/pdf_done"
TXTDIR="$ROOT/txt_armies"
OUTDIR="$ROOT/src/data/armies"

mkdir -p "$TODO" "$DONE" "$TXTDIR" "$OUTDIR"

shopt -s nullglob
pdfs=("$TODO"/*.pdf)

if (( ${#pdfs[@]} == 0 )); then
    echo "Nothing to do — $TODO is empty."
    exit 0
fi

if [[ -z "${VIRTUAL_ENV:-}" && -f "$ROOT/venv/bin/activate" ]]; then
    # shellcheck disable=SC1091
    source "$ROOT/venv/bin/activate"
fi

echo "Found ${#pdfs[@]} PDF(s) in $TODO."
echo

for pdf in "${pdfs[@]}"; do
    base=$(basename "$pdf" .pdf)
    txt="$TXTDIR/$base.txt"
    out="$OUTDIR/$base.json"

    echo "==> $base"

    if [[ -f "$out" ]]; then
        echo "  ↷ $out exists — skipping conversion, moving PDF to done"
        mv "$pdf" "$DONE/"
        echo
        continue
    fi

    # Step 1: text extraction
    if [[ ! -f "$txt" ]]; then
        pdftotext -layout "$pdf" "$txt" || {
            echo "  ✗ pdftotext failed — leaving in todo"
            echo
            continue
        }
    fi

    # Step 2: LLM → JSON
    if python "$ROOT/tools/txt2json.py" "$txt" "$out"; then
        mv "$pdf" "$DONE/"
        echo "  ✓ moved to done"
    else
        echo "  ✗ conversion failed — leaving in todo for inspection"
    fi
    echo
done

echo "Done. JSON in $OUTDIR, PDFs archived in $DONE."