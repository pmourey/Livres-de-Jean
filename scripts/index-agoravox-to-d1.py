#!/usr/bin/env python3
"""
Script d'indexation des articles et commentaires AgoraVox d'Émile Mourey
vers Cloudflare D1 (table `agoravox_chunks` + index plein texte FTS5).

Usage :
  python3 scripts/index-agoravox-to-d1.py ~/Agoravox
"""

import glob
import html
import os
import re
import sys
from html.parser import HTMLParser

INPUT_DIR = os.path.expanduser(sys.argv[1] if len(sys.argv) > 1 else "~/Agoravox")
OUT_PREFIX = os.path.abspath("migrations/0005_seed_agoravox")
CHUNK_SIZE = 1200
CHUNK_OVERLAP = 200
ROWS_PER_FILE = 2500


def sql_escape(val: str) -> str:
    return "'" + str(val or "").replace("'", "''") + "'"


def clean_text(raw_html: str) -> str:
    s = re.sub(r"<script[^>]*>.*?</script>", " ", raw_html, flags=re.S | re.I)
    s = re.sub(r"<style[^>]*>.*?</style>", " ", s, flags=re.S | re.I)
    s = re.sub(r"<form[^>]*>.*?</form>", " ", s, flags=re.S | re.I)
    s = re.sub(r"<br\s*/?>", "\n", s, flags=re.I)
    s = re.sub(r"</p>|</div>|</li>|</h[1-6]>|</blockquote>", "\n", s, flags=re.I)
    s = re.sub(r"<[^>]+>", " ", s)
    s = html.unescape(s).replace("\xa0", " ").replace("\r", "")
    s = re.sub(r"[ \t]+", " ", s)
    s = re.sub(r"\n[ \t]+", "\n", s)
    s = re.sub(r"\n{3,}", "\n\n", s)
    return s.strip()


def split_chunks(text: str, max_len: int = CHUNK_SIZE, overlap: int = CHUNK_OVERLAP):
    t = text.strip()
    if len(t) < 40:
        return []
    if len(t) <= max_len:
        return [t]
    chunks = []
    start = 0
    while start < len(t):
        end = min(start + max_len, len(t))
        if end < len(t):
            brk = max(t.rfind("\n\n", start, end), t.rfind(". ", start, end))
            if brk > start + int(max_len * 0.5):
                end = brk + 1
        piece = t[start:end].strip()
        if len(piece) >= 40:
            chunks.append(piece)
        if end >= len(t):
            break
        start = max(0, end - overlap)
    return chunks


class DivExtractor(HTMLParser):
    """Extrait le HTML interne des <div> portant une classe cible (en gérant l'imbrication)."""

    def __init__(self, target_class: str):
        super().__init__(convert_charrefs=False)
        self.target_class = target_class
        self.depth = 0
        self.capturing = False
        self.buf = []
        self.results = []

    def handle_starttag(self, tag, attrs):
        attrs_dict = dict(attrs)
        cls = attrs_dict.get("class", "") or ""
        classes = cls.split()
        if not self.capturing and tag == "div" and self.target_class in classes:
            self.capturing = True
            self.depth = 1
            self.buf = []
            return
        if self.capturing:
            if tag == "div":
                self.depth += 1
            attr_str = "".join(f' {k}="{v}"' if v is not None else f" {k}" for k, v in attrs)
            self.buf.append(f"<{tag}{attr_str}>")

    def handle_endtag(self, tag):
        if self.capturing:
            if tag == "div":
                self.depth -= 1
                if self.depth == 0:
                    self.results.append("".join(self.buf))
                    self.capturing = False
                    self.buf = []
                    return
            self.buf.append(f"</{tag}>")

    def handle_data(self, data):
        if self.capturing:
            self.buf.append(data)

    def handle_entityref(self, name):
        if self.capturing:
            self.buf.append(f"&{name};")

    def handle_charref(self, name):
        if self.capturing:
            self.buf.append(f"&#{name};")


def extract_balanced_div(doc: str, class_name: str):
    parser = DivExtractor(class_name)
    try:
        parser.feed(doc)
    except Exception:
        pass
    return parser.results


def parse_agoravox_html(filepath: str):
    raw = open(filepath, "rb").read()
    m_enc = re.search(rb"charset=([a-zA-Z0-9_-]+)", raw[:6000], re.I)
    enc = m_enc.group(1).decode("ascii", errors="ignore") if m_enc else "utf-8"
    try:
        doc = raw.decode(enc, errors="replace")
    except LookupError:
        doc = raw.decode("utf-8", errors="replace")

    # URL canonique live AgoraVox
    m_url = re.search(r'<meta[^>]+property=["\']og:url["\'][^>]+content=["\']([^"\']+)["\']', doc, re.I)
    if not m_url:
        m_url = re.search(r'<meta[^>]+content=["\'](https?://(?:www\.)?agoravox\.fr/[^"\']+)["\'][^>]+property=["\']og:url["\']', doc, re.I)
    article_url = m_url.group(1).strip() if m_url else "https://www.agoravox.fr/auteur/emile-mourey"

    # Titre de l'article
    m_title = re.search(r'<meta[^>]+property=["\']og:title["\'][^>]+content=["\']([^"\']+)["\']', doc, re.I)
    if not m_title:
        m_title = re.search(r"<title>(.*?)</title>", doc, re.S | re.I)
    raw_title = html.unescape(m_title.group(1)) if m_title else os.path.splitext(os.path.basename(filepath))[0]
    article_title = re.sub(r"\s*-\s*AgoraVox.*$", "", raw_title, flags=re.I).strip()

    # Date de publication de l'article
    m_date = re.search(r'<meta[^>]+property=["\']article:published_time["\'][^>]+content=["\']([^"\']+)["\']', doc, re.I)
    pub_date = m_date.group(1)[:10] if m_date else ""

    # Corps de l'article (chapo + cadretexte)
    chapos = extract_balanced_div(doc, "textechapo")
    cadres = extract_balanced_div(doc, "cadretexte")
    article_parts = []
    if chapos:
        c_txt = clean_text(chapos[0])
        if c_txt:
            article_parts.append(c_txt)
    if cadres:
        body_html = cadres[0]
        # Retire les widgets readspeaker / signaler
        body_html = re.sub(r'<div[^>]+id=["\'](?:signaler_art|readspeaker_button1)["\'][^>]*>.*?</div>', " ", body_html, flags=re.S | re.I)
        b_txt = clean_text(body_html)
        if b_txt:
            article_parts.append(b_txt)

    article_text = "\n\n".join(article_parts).strip()

    # Extraction des commentaires (ancres #forum...)
    comments = []
    # Découpe autour de chaque ancre id="forum123456"
    forum_splits = list(re.finditer(r'id=["\'](forum\d+)["\']', doc, re.I))
    for i, match in enumerate(forum_splits):
        anchor_id = match.group(1)
        start_pos = match.start()
        end_pos = forum_splits[i + 1].start() if i + 1 < len(forum_splits) else min(len(doc), start_pos + 12000)
        segment = doc[start_pos:end_pos]

        # Auteur du commentaire
        m_auth = re.search(r'<a[^>]+href=["\'][^"\']*/auteur/[^"\']*["\'][^>]*>(.*?)</a>', segment[:1200], re.S | re.I)
        if m_auth:
            c_author = clean_text(m_auth.group(1))
        else:
            m_strong = re.search(r"<strong[^>]*>(.*?)</strong>", segment[:800], re.S | re.I)
            c_author = clean_text(m_strong.group(1)) if m_strong else "Lecteur AgoraVox"
        c_author = c_author[:80] or "Lecteur AgoraVox"

        # Date du commentaire
        m_cdate = re.search(r'<span[^>]+class=["\']date["\'][^>]*>(.*?)</span>', segment[:1500], re.S | re.I)
        c_date = clean_text(m_cdate.group(1))[:40] if m_cdate else ""

        # Texte du commentaire
        ft_blocks = extract_balanced_div(segment, "forum-texte")
        if not ft_blocks:
            continue
        c_text = clean_text(ft_blocks[0])
        if len(c_text) < 40:
            continue

        comments.append({
            "anchor": anchor_id,
            "url": f"{article_url}#{anchor_id}",
            "author": c_author,
            "date": c_date,
            "text": c_text[:2000],
        })

    return {
        "title": article_title,
        "url": article_url,
        "date": pub_date,
        "text": article_text,
        "comments": comments,
    }


def main():
    if not os.path.isdir(INPUT_DIR):
        print(f"Dossier introuvable : {INPUT_DIR}", file=sys.stderr)
        sys.exit(1)

    html_files = sorted(glob.glob(os.path.join(INPUT_DIR, "*.html")))
    print(f"Analyse de {len(html_files)} fichiers HTML AgoraVox dans {INPUT_DIR}...")

    inserts = []
    article_count = 0
    article_chunk_count = 0
    comment_count = 0
    seen_urls = set()

    for fp in html_files:
        parsed = parse_agoravox_html(fp)
        url = parsed["url"]
        if url != "https://www.agoravox.fr/auteur/emile-mourey" and url in seen_urls:
            continue
        seen_urls.add(url)

        chunks = split_chunks(parsed["text"])
        if chunks:
            article_count += 1
            for idx, ch in enumerate(chunks):
                inserts.append(
                    f"INSERT INTO agoravox_chunks (source_type, article_title, article_url, source_url, author_name, published_date, chunk_index, content) "
                    f"VALUES ('article', {sql_escape(parsed['title'])}, {sql_escape(url)}, {sql_escape(url)}, 'Émile Mourey', {sql_escape(parsed['date'])}, {idx}, {sql_escape(ch)});"
                )
                article_chunk_count += 1

        for c in parsed["comments"]:
            # On indexe chaque commentaire significatif (et prioritairement ceux d'Émile Mourey et débats substantiels)
            c_chunks = split_chunks(c["text"], max_len=1200, overlap=150)
            for idx, ch in enumerate(c_chunks):
                inserts.append(
                    f"INSERT INTO agoravox_chunks (source_type, article_title, article_url, source_url, author_name, published_date, chunk_index, content) "
                    f"VALUES ('comment', {sql_escape(parsed['title'])}, {sql_escape(url)}, {sql_escape(c['url'])}, {sql_escape(c['author'])}, {sql_escape(c['date'])}, {idx}, {sql_escape(ch)});"
                )
                comment_count += 1

    # Nettoyer d'anciens fichiers de seed partiels
    for old in glob.glob(f"{OUT_PREFIX}_part*.sql"):
        os.remove(old)

    os.makedirs(os.path.dirname(OUT_PREFIX), exist_ok=True)
    part_files = []
    total_parts = (len(inserts) + ROWS_PER_FILE - 1) // ROWS_PER_FILE

    for p in range(total_parts):
        chunk_rows = inserts[p * ROWS_PER_FILE : (p + 1) * ROWS_PER_FILE]
        out_file = f"{OUT_PREFIX}_part{p+1:02d}.sql"
        header = [f"-- AgoraVox seed part {p+1}/{total_parts} (NE PAS COMMITER SUR GIT)"]
        if p == 0:
            header.append("DELETE FROM agoravox_chunks;")
        with open(out_file, "w", encoding="utf-8") as f:
            f.write("\n".join(header + chunk_rows) + "\n")
        part_files.append(out_file)

    print(f"✓ {article_count} articles extraits ({article_chunk_count} passages)")
    print(f"✓ {comment_count} passages de commentaires extraits (avec ancres #forum...)")
    print(f"✓ {len(inserts)} lignes SQL réparties en {len(part_files)} fichier(s) : {', '.join(os.path.basename(x) for x in part_files)}")


if __name__ == "__main__":
    main()
