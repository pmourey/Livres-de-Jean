#!/usr/bin/env python3
"""
Récupère sur https://www.agoravox.fr/auteur/emile-mourey tous les articles (et leurs commentaires)
absents de l'archive locale ~/Agoravox, puis génère des fichiers SQL additifs pour Cloudflare D1
(table `agoravox_chunks`).

Usage :
  python3 scripts/sync-missing-agoravox.py ~/Agoravox
"""

import glob
import os
import re
import subprocess
import sys
import time

# Réutilise le parseur et les helpers de scripts/index-agoravox-to-d1.py
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from importlib.machinery import SourceFileLoader

indexer = SourceFileLoader(
    "index_agoravox",
    os.path.join(os.path.dirname(os.path.abspath(__file__)), "index-agoravox-to-d1.py"),
).load_module()

LOCAL_ARCHIVE_DIR = os.path.expanduser(sys.argv[1] if len(sys.argv) > 1 else "~/Agoravox")
OUT_PREFIX = os.path.abspath("migrations/0006_seed_agoravox_missing")
ROWS_PER_FILE = 2500
USER_AGENT = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) EditionsEmileMoureyIndexer/1.0"


def fetch_bytes(url: str, timeout: int = 20) -> bytes:
    return subprocess.check_output(
        ["curl", "-sSL", "-A", USER_AGENT, "--max-time", str(timeout), url],
        stderr=subprocess.DEVNULL,
    )


def normalize_url(url: str) -> str:
    u = url.strip().split("#")[0].split("?")[0]
    u = re.sub(r"^http://", "https://", u)
    if u.startswith("/"):
        u = "https://www.agoravox.fr" + u
    return u.rstrip("/")


def get_existing_archive_urls(archive_dir: str) -> set[str]:
    existing = set()
    if not os.path.isdir(archive_dir):
        return existing
    for fp in glob.glob(os.path.join(archive_dir, "*.html")):
        try:
            raw = open(fp, "rb").read(20000)
            txt = raw.decode("latin-1", errors="ignore")
            m = re.search(
                r'<meta[^>]+property=["\']og:url["\'][^>]+content=["\']([^"\']+)["\']',
                txt,
                re.I,
            )
            if not m:
                m = re.search(
                    r'<meta[^>]+content=["\'](https?://(?:www\.)?agoravox\.fr/[^"\']+)["\'][^>]+property=["\']og:url["\']',
                    txt,
                    re.I,
                )
            if m:
                existing.add(normalize_url(m.group(1)))
        except Exception:
            pass
    return existing


def collect_all_live_article_urls() -> list[str]:
    all_urls = []
    seen = set()
    offset = 0
    empty_pages = 0

    while offset <= 700 and empty_pages < 2:
        page_url = (
            "https://www.agoravox.fr/auteur/emile-mourey"
            if offset == 0
            else f"https://www.agoravox.fr/auteur/emile-mourey?debut_articles={offset}"
        )
        try:
            html_txt = fetch_bytes(page_url).decode("utf-8", errors="ignore")
        except Exception as e:
            print(f"  ! Erreur lecture page offset={offset}: {e}", file=sys.stderr)
            break

        # Extraire uniquement les liens d'articles de la liste principale (contenant un ID numérique en fin d'URL)
        found = re.findall(
            r'href=["\']((?:https?://(?:www\.)?agoravox\.fr)?/(?:tribune-libre|actualites|culture-loisirs)[^"\']*/article/[^"\'#?]+-\d+)["\']',
            html_txt,
            re.I,
        )
        new_on_page = 0
        for raw_u in found:
            u = normalize_url(raw_u)
            if u not in seen:
                seen.add(u)
                all_urls.append(u)
                new_on_page += 1

        if new_on_page == 0:
            empty_pages += 1
        else:
            empty_pages = 0

        if offset % 100 == 0:
            print(f"  Scan pagination offset={offset}... ({len(all_urls)} articles trouvés)")
        offset += 10
        time.sleep(0.15)

    return all_urls


def parse_live_html_bytes(raw: bytes, fallback_url: str):
    import tempfile

    with tempfile.NamedTemporaryFile(suffix=".html", delete=False) as tf:
        tf.write(raw)
        tmp_path = tf.name
    try:
        parsed = indexer.parse_agoravox_html(tmp_path)
        if parsed["url"] == "https://www.agoravox.fr/auteur/emile-mourey":
            parsed["url"] = fallback_url
        return parsed
    finally:
        if os.path.exists(tmp_path):
            os.remove(tmp_path)


def main():
    existing_urls = get_existing_archive_urls(LOCAL_ARCHIVE_DIR)
    print(f"Archive locale : {len(existing_urls)} URLs déjà indexées.")

    print("Scan complet de https://www.agoravox.fr/auteur/emile-mourey ...")
    live_urls = collect_all_live_article_urls()
    print(f"Total articles trouvés en ligne sur AgoraVox : {len(live_urls)}")

    # Filtrer les articles réellement manquants (comparaison par ID numérique d'article en fin d'URL)
    def article_id(u: str) -> str:
        m = re.search(r"-(\d+)$", u)
        return m.group(1) if m else u

    existing_ids = {article_id(u) for u in existing_urls}
    missing_urls = [u for u in live_urls if article_id(u) not in existing_ids]
    print(f"Articles manquants à extraire : {len(missing_urls)}")

    if not missing_urls:
        print("Aucun article manquant : votre index D1 est déjà complet !")
        return

    inserts = []
    articles_ok = 0
    article_chunks = 0
    comment_chunks = 0

    for idx, url in enumerate(missing_urls, 1):
        try:
            raw = fetch_bytes(url)
            parsed = parse_live_html_bytes(raw, url)
            chunks = indexer.split_chunks(parsed["text"])
            if chunks:
                articles_ok += 1
                for c_idx, ch in enumerate(chunks):
                    inserts.append(
                        f"INSERT INTO agoravox_chunks (source_type, article_title, article_url, source_url, author_name, published_date, chunk_index, content) "
                        f"VALUES ('article', {indexer.sql_escape(parsed['title'])}, {indexer.sql_escape(parsed['url'])}, {indexer.sql_escape(parsed['url'])}, 'Émile Mourey', {indexer.sql_escape(parsed['date'])}, {c_idx}, {indexer.sql_escape(ch)});"
                    )
                    article_chunks += 1

            for c in parsed["comments"]:
                c_list = indexer.split_chunks(c["text"], max_len=1200, overlap=150)
                for c_idx, ch in enumerate(c_list):
                    inserts.append(
                        f"INSERT INTO agoravox_chunks (source_type, article_title, article_url, source_url, author_name, published_date, chunk_index, content) "
                        f"VALUES ('comment', {indexer.sql_escape(parsed['title'])}, {indexer.sql_escape(parsed['url'])}, {indexer.sql_escape(c['url'])}, {indexer.sql_escape(c['author'])}, {indexer.sql_escape(c['date'])}, {c_idx}, {indexer.sql_escape(ch)});"
                    )
                    comment_chunks += 1

            if idx % 15 == 0 or idx == len(missing_urls):
                print(
                    f"  Progression : {idx}/{len(missing_urls)} articles traités "
                    f"({article_chunks} passages articles, {comment_chunks} passages commentaires)"
                )
        except Exception as e:
            print(f"  ! Ignoré ({url}): {e}", file=sys.stderr)
        time.sleep(0.25)

    for old in glob.glob(f"{OUT_PREFIX}_part*.sql"):
        os.remove(old)

    os.makedirs(os.path.dirname(OUT_PREFIX), exist_ok=True)
    total_parts = (len(inserts) + ROWS_PER_FILE - 1) // ROWS_PER_FILE
    part_files = []
    for p in range(total_parts):
        rows = inserts[p * ROWS_PER_FILE : (p + 1) * ROWS_PER_FILE]
        out_file = f"{OUT_PREFIX}_part{p+1:02d}.sql"
        with open(out_file, "w", encoding="utf-8") as f:
            f.write(f"-- AgoraVox missing articles seed part {p+1}/{total_parts} (NE PAS COMMITER SUR GIT)\n")
            f.write("\n".join(rows) + "\n")
        part_files.append(out_file)

    print(f"\n✓ {articles_ok} articles manquants extraits ({article_chunks} passages)")
    print(f"✓ {comment_chunks} passages de commentaires extraits (avec ancres #forum...)")
    print(f"✓ {len(inserts)} lignes SQL écrites dans {len(part_files)} fichier(s) : {', '.join(os.path.basename(x) for x in part_files)}")


if __name__ == "__main__":
    main()
