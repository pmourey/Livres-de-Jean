#!/usr/bin/env python3
"""
Enrichit la table Cloudflare D1 `academic_chunks` avec le texte intégral des synthèses et
conclusions de fouilles issues des PDF en libre accès sur CNRS HAL-SHS pour les trois
grands dossiers archéologiques : Bibracte / Mont Beuvray, Alésia / Alise-Sainte-Reine
et Gergovie / Arvernes.

Sortie : migrations/0012_seed_academic_fulltext.sql
"""

import json
import os
import re
import subprocess
import tempfile
import urllib.parse

HAL_API = "https://api.archives-ouvertes.fr/search/"

QUERIES = [
    ("Bibracte & Éduens", '((Bibracte OR "Mont Beuvray") AND (fouille OR rempart OR oppidum OR amphore))', 12),
    ("Alésia & Siège de 52 av. J.-C.", '((Alesia OR "Alise-Sainte-Reine") AND (fouille OR siege OR circonvallation OR camp OR oppidum))', 10),
    ("Gergovie & Arvernes", '((Gergovie OR Merdogne OR Corent) AND (fouille OR oppidum OR camp OR fortification))', 10),
]

OUT_SQL = os.path.join(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
    "migrations",
    "0012_seed_academic_fulltext.sql",
)


def curl_get(url: str, timeout: int = 25) -> bytes:
    return subprocess.check_output(
        ["curl", "-sSL", "--max-time", str(timeout), "-A", "EditionsEmileMourey-AcademicIndexer/1.0", url],
        stderr=subprocess.DEVNULL,
    )


def sql_esc(s: str) -> str:
    return s.replace("'", "''")


def clean_text(raw: str) -> str:
    s = re.sub(r"-\s*\n\s*", "", raw)
    s = re.sub(r"[ \t]+", " ", s)
    s = re.sub(r"\n{3,}", "\n\n", s)
    return s.strip()


def extract_key_sections(full_text: str, max_chars: int = 5200) -> str:
    """
    Extrait le cœur scientifique du PDF : introduction/méthodologie + sections de
    résultats/conclusions/synthèse archéologique (pour enrichir au-delà du résumé).
    """
    txt = clean_text(full_text)
    if len(txt) <= max_chars:
        return txt

    # Chercher une section Conclusion / Synthèse / Bilan / Discussion
    m_concl = None
    for pat in (
        r"\n(?:[0-9IVX\.\-\s]{0,8})(?:Conclusion|Conclusions|Synthèse|Bilan|Discussion|En conclusion)\b[^\n]{0,80}\n",
        r"\b(?:CONCLUSION|CONCLUSIONS|SYNTHÈSE|BILAN)\b",
    ):
        matches = list(re.finditer(pat, txt, re.I))
        if matches:
            # Prendre l'occurrence dans la seconde moitié du document si possible
            later = [m for m in matches if m.start() > len(txt) * 0.35]
            m_concl = later[-1] if later else matches[-1]
            break

    intro_part = txt[:2200].strip()
    if m_concl:
        concl_start = m_concl.start()
        concl_part = txt[concl_start : concl_start + 3000].strip()
        return f"{intro_part}\n\n[...]\n\n{concl_part}"[:max_chars]

    # Sinon : début + fin (avant bibliographie si détectée)
    bib = re.search(r"\n(?:Bibliographie|Références bibliographiques|References)\b", txt, re.I)
    end_pos = bib.start() if bib and bib.start() > 3500 else len(txt)
    tail_start = max(2200, end_pos - 2800)
    tail_part = txt[tail_start:end_pos].strip()
    return f"{intro_part}\n\n[...]\n\n{tail_part}"[:max_chars]


def map_doc_type(hal_type: str) -> str:
    t = (hal_type or "").upper()
    if t in ("THESE", "HDR", "MEM"):
        return "thesis"
    if t in ("REPORT", "OTHERREPORT"):
        return "report"
    if t in ("OUV", "COUV", "DOUV"):
        return "book"
    return "article"


def main():
    seen_urls = set()
    sql_lines = [
        "-- Enrichissement plein texte (introductions & conclusions de fouilles) depuis les PDF ouverts CNRS HAL-SHS\n",
        "-- Cibles : Bibracte / Mont Beuvray, Alésia / Alise-Sainte-Reine, Gergovie / Arvernes\n\n",
    ]
    total_enriched = 0

    with tempfile.TemporaryDirectory() as tmpdir:
        for theme, q, target_count in QUERIES:
            params = urllib.parse.urlencode(
                {
                    "q": q,
                    "fq": "openAccess_bool:true AND submitType_s:file",
                    "fl": "halId_s,title_s,authFullName_s,producedDateY_i,journalTitle_s,docType_s,uri_s,fileMain_s,abstract_s",
                    "rows": str(target_count * 2),
                    "sort": "score desc",
                    "wt": "json",
                }
            )
            print(f"\nRecherche PDF libres HAL-SHS [{theme}]...")
            try:
                resp = json.loads(curl_get(f"{HAL_API}?{params}").decode("utf-8", errors="ignore"))
                docs = resp.get("response", {}).get("docs", [])
            except Exception as e:
                print(f"  Erreur requête HAL: {e}")
                continue

            theme_added = 0
            for doc in docs:
                if theme_added >= target_count:
                    break
                uri = (doc.get("uri_s") or "").strip()
                pdf_url = (doc.get("fileMain_s") or "").strip()
                if not uri or not pdf_url or uri in seen_urls:
                    continue
                if not pdf_url.lower().endswith(".pdf") and "/document" not in pdf_url.lower():
                    continue

                title_list = doc.get("title_s") or []
                title = (title_list[0] if isinstance(title_list, list) and title_list else str(title_list)).strip()
                if not title:
                    continue

                authors_list = doc.get("authFullName_s") or []
                authors = ", ".join(authors_list[:6]) if isinstance(authors_list, list) else str(authors_list)
                year = str(doc.get("producedDateY_i") or "")
                journal = (doc.get("journalTitle_s") or "CNRS HAL-SHS (PDF libre accès)").strip()
                doc_type = map_doc_type(doc.get("docType_s") or "")
                hal_id = doc.get("halId_s") or f"doc-{total_enriched}"

                pdf_path = os.path.join(tmpdir, f"{hal_id}.pdf")
                try:
                    pdf_bytes = curl_get(pdf_url, timeout=20)
                    if len(pdf_bytes) < 4000 or not pdf_bytes[:5].startswith(b"%PDF-"):
                        continue
                    with open(pdf_path, "wb") as fp:
                        fp.write(pdf_bytes)
                    # Extraire jusqu'aux 25 premières pages + 15 dernières si gros rapport, ou tout via pdftotext
                    txt = subprocess.check_output(
                        ["pdftotext", "-enc", "UTF-8", pdf_path, "-"],
                        stderr=subprocess.DEVNULL,
                        timeout=15,
                    ).decode("utf-8", errors="ignore")
                except Exception:
                    continue

                if len(txt.strip()) < 600:
                    continue

                excerpt = extract_key_sections(txt, max_chars=5200)
                enriched_content = f"[TEXTE INTÉGRAL EXTRAIT DU PDF HAL EN LIBRE ACCÈS : {pdf_url}]\n\n{excerpt}"

                seen_urls.add(uri)
                # Mettre à jour si déjà présent sur source_url, sinon insérer
                sql_lines.append(
                    f"INSERT INTO academic_chunks (doc_type, title, authors, published_year, journal_or_institution, source_url, theme, content) "
                    f"VALUES ('{sql_esc(doc_type)}', '{sql_esc(title)}', '{sql_esc(authors)}', '{sql_esc(year)}', "
                    f"'{sql_esc(journal)}', '{sql_esc(uri)}', '{sql_esc(theme)}', '{sql_esc(enriched_content)}') "
                    f"ON CONFLICT(source_url) DO UPDATE SET content = excluded.content, journal_or_institution = excluded.journal_or_institution;\n"
                )
                theme_added += 1
                total_enriched += 1
                print(f"  ✓ [{theme_added}/{target_count}] {hal_id} ({year}) — {title[:75]} ({len(enriched_content)} car.)")

    with open(OUT_SQL, "w", encoding="utf-8") as fp:
        fp.writelines(sql_lines)
    print(f"\n✓ {total_enriched} rapports/articles HAL-SHS enrichis en texte intégral -> {OUT_SQL} ({os.path.getsize(OUT_SQL)/1024:.1f} KB)")


if __name__ == "__main__":
    main()
