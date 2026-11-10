#!/bin/bash
# Mantık testleri + ekran robotu. Hepsi geçmeden canlıya alınmaz.
cd "$(dirname "$0")"
HTML="${HTML:-$(cd ..; cd ..; pwd)/index.html}"; export HTML
fail=0
run(){ echo "▶ $1"; out=$(timeout 600 node "$1.js" 2>&1); echo "$out" | grep -v "^    at" | tail -4; if echo "$out" | grep -q "HATA\|SyntaxError\|ReferenceError\|TypeError"; then echo "   ❌ $1"; fail=1; fi; }
run kadro-tekrar; run kura-kilit; run turnuva; run skor-oranlar; run ilk11-kalicilik; run firebase
echo "▶ ekran robotu"; python3 robot.py "$HTML" || fail=1
if [ $fail = 0 ]; then echo "✅ TÜM TESTLER GEÇTİ"; else echo "❌ TEST BAŞARISIZ, canlıya alma"; exit 1; fi
