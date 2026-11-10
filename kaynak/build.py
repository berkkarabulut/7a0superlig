#!/usr/bin/env python3
"""Süper Lig 7-0 derleyici.

src/sablon.html + src/css/*.css + src/js/*.js + data4.json  ->  ../index.html

Dosyalar ada göre sıralanıp birleştirilir (01-, 02- ... önekleri sırayı belirler).
Derlemeden önce CSS çakışma kontrolü yapılır: bir sınıf adı birden fazla CSS
dosyasında tanımlanıyorsa ve izin listesinde (css-izinli-cakismalar.txt) yoksa
derleme durur. Böylece bir parçaya eklenen stil başka parçadaki bir şeyi
habersizce ezemez (ör. sürükleme için yazılan .ghost, butonlardaki .btn.ghost'u
bozmuştu).

Kullanım:
  python3 build.py              # derle (çakışma varsa durur)
  python3 build.py --izinleri-guncelle   # mevcut çakışmaları izin listesine yaz
  python3 build.py --cikti /tmp/x.html   # başka yere derle
"""
import json, os, re, sys, glob

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = os.path.join(HERE, "src")
ALLOW = os.path.join(HERE, "css-izinli-cakismalar.txt")


def read(p):
    with open(p, encoding="utf-8") as f:
        return f.read()


def css_classes(css):
    css = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
    out = set()
    for prelude in re.findall(r"([^{}]+)\{", css):
        prelude = prelude.strip()
        if prelude.startswith("@"):
            continue
        out.update(re.findall(r"\.([A-Za-z_][\w-]*)", prelude))
    return out


def collisions(files):
    owners = {}
    for f in files:
        for c in css_classes(read(f)):
            owners.setdefault(c, []).append(os.path.basename(f))
    return {c: fs for c, fs in owners.items() if len(fs) > 1}


def main():
    args = sys.argv[1:]
    css_files = sorted(glob.glob(os.path.join(SRC, "css", "*.css")))
    js_files = sorted(glob.glob(os.path.join(SRC, "js", "*.js")))

    col = collisions(css_files)
    if "--izinleri-guncelle" in args:
        with open(ALLOW, "w", encoding="utf-8") as f:
            f.write("# Birden fazla CSS dosyasında bilerek tanımlanan sınıflar (tema/mobil üzerine yazmaları).\n")
            f.write("# Yeni bir sınıf buraya ancak bilinçli bir üzerine yazmaysa eklenir.\n")
            for c in sorted(col):
                f.write(f"{c}: {', '.join(col[c])}\n")
        print(f"izin listesi güncellendi: {len(col)} sınıf")
        return 0

    allowed = {}
    if os.path.exists(ALLOW):
        for line in read(ALLOW).splitlines():
            if line.strip() and not line.startswith("#"):
                c, fs = line.split(":", 1)
                allowed[c.strip()] = {x.strip() for x in fs.split(",")}
    bad = [(c, fs) for c, fs in col.items() if c not in allowed or not set(fs) <= allowed[c]]
    if bad:
        print("❌ CSS ÇAKIŞMASI: aynı sınıf adı birden fazla parçada tanımlanmış.")
        for c, fs in sorted(bad):
            print(f"   .{c}  ->  {', '.join(fs)}")
        print("   Yeni stile o parçaya özel bir ad ver (ör. sb-..., mo-...).")
        print("   Bilinçli bir üzerine yazmaysa: python3 build.py --izinleri-guncelle")
        return 1

    shell = read(os.path.join(SRC, "sablon.html"))
    css = "".join(read(f) for f in css_files)
    js = "".join(read(f) for f in js_files)
    data = json.load(open(os.path.join(HERE, "data4.json"), encoding="utf-8"))
    html = shell.replace("/*CSS*/", css, 1).replace("/*JS*/", js, 1).replace("/*DATA*/", json.dumps(data, ensure_ascii=False), 1)
    out = os.path.join(HERE, "..", "index.html")
    if "--cikti" in args:
        out = args[args.index("--cikti") + 1]
    with open(out, "w", encoding="utf-8") as f:
        f.write(html)
    print(f"✅ derlendi: {os.path.relpath(out)}  ({len(css_files)} css, {len(js_files)} js, {len(html)//1024} KB)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
