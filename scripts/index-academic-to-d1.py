#!/usr/bin/env python3
"""
Indexe les publications scientifiques officielles (CNRS HAL-SHS, Gallia / Persée, INRAP,
thèses universitaires et rapports de fouilles archéologiques) liées aux thématiques
des ouvrages d'Émile Mourey dans la table Cloudflare D1 `academic_chunks`.

Usage :
  python3 scripts/index-academic-to-d1.py
"""

import json
import os
import re
import subprocess
import time
import urllib.parse

OUT_FILE = os.path.abspath("migrations/0009_seed_academic_chunks.sql")

HAL_QUERIES = [
    ("Bibracte & Éduens", "Bibracte OR \"Mont Beuvray\" OR Gorgobina", 160),
    ("Alésia & Siège de 52 av. J.-C.", "Alesia OR \"Alise-Sainte-Reine\" OR \"mont Auxois\"", 160),
    ("Gergovie & Arvernes", "Gergovie OR Merdogne OR (Arvernes AND oppidum)", 140),
    ("Guerre des Gaules & Légions", "\"Guerre des Gaules\" OR \"De Bello Gallico\" OR Vercingetorix", 120),
    ("Bourgogne antique, Autun & Chalon", "Augustodunum OR Cabillonum OR \"Mont-Saint-Vincent\" OR (Eduens AND Saone)", 120),
    ("Table de Peutinger & Voies romaines", "\"Table de Peutinger\" OR \"voies romaines\" Gaule", 90),
    ("Art roman bourguignon (Vézelay, Autun, Chalon)", "(Vezelay AND tympan) OR (Autun AND chapiteaux AND roman) OR (\"sculpture romane\" AND Bourgogne)", 110),
    ("Esséniens, Qumrân & Judéo-christianisme", "Esseniens OR Qumran OR \"judeo-christianisme\" OR \"mer Morte\"", 110),
    ("Origines de l'islam, Coran & Tabari", "(\"origines de l'islam\" AND Coran) OR (Tabari AND islam) OR \" Mecque\" historiographie", 100),
]

# Références académiques canoniques discutées directement dans les dossiers d'Émile Mourey
CANONICAL_REFERENCES = [
    {
        "doc_type": "report",
        "title": "Les recherches archéologiques sur le mont Beuvray (1984-1995) — Dossier Bibracte, Gallia 55",
        "authors": "Vincent Guichard, Olivier Buchsenschutz, Jean-Paul Guillaumet, Daniele Vitali et al. (CNRS / Centre archéologique européen de Bibracte)",
        "published_year": "1998",
        "journal_or_institution": "Gallia - Archéologie de la France antique, tome 55 (CNRS Éditions)",
        "source_url": "https://www.persee.fr/issue/galia_0016-4119_1998_num_55_1",
        "theme": "Bibracte & Éduens",
        "content": (
            "Synthèse officielle du CNRS (Gallia 55, 1998) sur la reprise des fouilles internationales au mont Beuvray. "
            "Les équipes archéologiques y documentent la stratigraphie des remparts (murus gallicus à deux états successifs, "
            "Porte du Rebout), l'urbanisme de l'oppidum de 200 hectares, les ateliers métallurgiques de la Côme Chaudron, "
            "les domus gallo-romaines précoces (Pâture du Couvent, Parc aux Chevaux), les importations d'amphores républicaines "
            "(Dressel 1) et le corpus numismatique éduen justifiant pour la communauté scientifique l'identification de Bibracte au mont Beuvray."
        ),
    },
    {
        "doc_type": "report",
        "title": "Alésia : L'archéologie face à l'imaginaire — Fouilles franco-allemandes sur le mont Auxois (1991-1997)",
        "authors": "Michel Reddé, Siegmar von Schnurbein, Laurent Popovitch, Hans-Joachim Schalles et al. (EPHE / RGK Francfort)",
        "published_year": "2001",
        "journal_or_institution": "Mémoires de l'Académie des Inscriptions et Belles-Lettres / Errance",
        "source_url": "https://www.persee.fr/doc/crai_0065-0536_1995_num_139_1_15460",
        "theme": "Alésia & Siège de 52 av. J.-C.",
        "content": (
            "Bilan des fouilles franco-allemandes dirigées par Michel Reddé et Siegmar von Schnurbein autour du mont Auxois "
            "à Alise-Sainte-Reine (1991-1997). Les campagnes de terrain et prospections aériennes confirment et précisent le tracé "
            "de la circonvallation et de la contrevallation de César dans la plaine des Laumes, du Rabutin et de Grésigny, les camps "
            "de hauteur (camp C à Bussy, mont Réa), les obstacles défensifs (cippi, stimuli, lilia), un abondant mobilier d'armement "
            "romain et gaulois du milieu du Ier s. av. J.-C. (balle de fronde au nom de T. Labienus) et un ensemble homogène de monnaies "
            "gauloises et républicaines."
        ),
    },
    {
        "doc_type": "report",
        "title": "Nouvelles recherches sur les travaux de César devant Gergovie (1995-2022)",
        "authors": "Yann Deberge, Thomas Pertlwieser, Peter Jud, Vincent Guichard (INRAP / ARAFA)",
        "published_year": "2019",
        "journal_or_institution": "Gallia / Revue archéologique du Centre de la France",
        "source_url": "https://journals.openedition.org/racf/2890",
        "theme": "Gergovie & Arvernes",
        "content": (
            "Réévaluation archéologique des ouvrages militaires romains au pied du plateau de Gergovie-Merdogne (La Roche-Blanche, Orcet). "
            "Les fouilles de l'ARAFA et de l'INRAP ont réexaminé le grand camp de La Serre d'Orcet, le petit camp de la colline de La Roche-Blanche "
            "et le double fossé (duplex fossa) les reliant, livrant des traits de catapulte en fer, des clous de caligae et des céramiques "
            "tardo-républicaines datées du milieu du Ier s. av. J.-C., confortant pour l'archéologie officielle la localisation du siège de 52 av. J.-C."
        ),
    },
    {
        "doc_type": "book",
        "title": "Bibracte et les Éduens : À la découverte d'un peuple gaulois",
        "authors": "Christian Goudineau, Christian Peyre (Collège de France / ENS)",
        "published_year": "1993",
        "journal_or_institution": "Éditions Errance / Centre archéologique européen du Mont Beuvray",
        "source_url": "https://www.bibracte.fr/la-recherche",
        "theme": "Bibracte & Éduens",
        "content": (
            "Ouvrage de synthèse de Christian Goudineau (professeur au Collège de France) et Christian Peyre sur l'histoire du peuple éduen, "
            "la topographie du mont Beuvray, les fouilles de Jacques-Gabriel Bulliot et Joseph Déchelette au XIXe siècle, l'alliance entre les "
            "Éduens et Rome (fratres consanguineique), la campagne de César contre les Helvètes en 58 av. J.-C. et le transfert d'Augustodunum (Autun) "
            "sous Auguste."
        ),
    },
]


def sql_escape(val: str) -> str:
    return "'" + str(val or "").replace("'", "''") + "'"


def clean_str(val: str) -> str:
    s = re.sub(r"<[^>]+>", " ", str(val or ""))
    s = re.sub(r"\s+", " ", s)
    return s.strip()


def fetch_hal_docs(query: str, rows: int = 120):
    params = {
        "q": query,
        "fq": 'abstract_s:["" TO *]',
        "fl": "docid,docType_s,title_s,subTitle_s,authFullName_s,producedDateY_i,journalTitle_s,bookTitle_s,authorityInstitution_s,uri_s,abstract_s,keyword_s",
        "rows": str(rows),
        "sort": "score desc",
        "wt": "json",
    }
    url = "https://api.archives-ouvertes.fr/search/?" + urllib.parse.urlencode(params)
    out = subprocess.check_output(
        ["curl", "-sSL", "--max-time", "25", url],
        stderr=subprocess.DEVNULL,
    )
    data = json.loads(out.decode("utf-8", errors="replace"))
    return data.get("response", {}).get("docs", [])


def map_hal_doctype(dt: str) -> str:
    dt = (dt or "").upper()
    if dt in ("THESE", "HDR", "MEM"):
        return "thesis"
    if dt in ("OUV", "COUV", "DOUV"):
        return "book"
    if dt in ("REPORT", "RAPPORT"):
        return "report"
    return "article"


def main():
    seen_urls = set()
    records = []

    for c in CANONICAL_REFERENCES:
        seen_urls.add(c["source_url"])
        records.append(c)

    for theme, q, max_rows in HAL_QUERIES:
        print(f"Requête CNRS HAL-SHS [{theme}] : {q} ...")
        try:
            docs = fetch_hal_docs(q, max_rows)
        except Exception as e:
            print(f"  ! Erreur HAL ({theme}): {e}")
            continue

        added = 0
        for d in docs:
            uri = clean_str(d.get("uri_s", ""))
            if not uri or uri in seen_urls:
                continue

            titles = d.get("title_s") or []
            subtitles = d.get("subTitle_s") or []
            title = clean_str(titles[0]) if titles else ""
            if subtitles and clean_str(subtitles[0]):
                title = f"{title} : {clean_str(subtitles[0])}"
            if not title:
                continue

            abstracts = d.get("abstract_s") or []
            abstract = clean_str(" ".join(abstracts[:2]))
            if len(abstract) < 60:
                continue

            authors = ", ".join((d.get("authFullName_s") or [])[:6]) or "Collectif CNRS / HAL"
            year = str(d.get("producedDateY_i") or "")
            journal = clean_str(
                d.get("journalTitle_s")
                or d.get("bookTitle_s")
                or (", ".join((d.get("authorityInstitution_s") or [])[:2]))
                or "Archive ouverte CNRS HAL-SHS"
            )
            keywords = ", ".join((d.get("keyword_s") or [])[:10])
            content = abstract[:1800]
            if keywords:
                content = f"{content}\nMots-clés : {keywords}"

            seen_urls.add(uri)
            records.append({
                "doc_type": map_hal_doctype(d.get("docType_s", "")),
                "title": title[:300],
                "authors": authors[:240],
                "published_year": year[:10],
                "journal_or_institution": journal[:200],
                "source_url": uri,
                "theme": theme,
                "content": content,
            })
            added += 1

        print(f"  + {added} publications scientifiques retenues (total cumulé : {len(records)})")
        time.sleep(0.2)

    lines = [
        "-- Généré automatiquement par scripts/index-academic-to-d1.py",
        "-- Publications scientifiques officielles (CNRS HAL-SHS, Gallia / Persée, INRAP, thèses)",
        "DELETE FROM academic_chunks;",
    ]
    for r in records:
        lines.append(
            f"INSERT OR IGNORE INTO academic_chunks (doc_type, title, authors, published_year, journal_or_institution, source_url, theme, content) "
            f"VALUES ({sql_escape(r['doc_type'])}, {sql_escape(r['title'])}, {sql_escape(r['authors'])}, {sql_escape(r['published_year'])}, "
            f"{sql_escape(r['journal_or_institution'])}, {sql_escape(r['source_url'])}, {sql_escape(r['theme'])}, {sql_escape(r['content'])});"
        )

    os.makedirs(os.path.dirname(OUT_FILE), exist_ok=True)
    with open(OUT_FILE, "w", encoding="utf-8") as f:
        f.write("\n".join(lines) + "\n")

    print(f"\n✓ {len(records)} publications scientifiques générées dans {OUT_FILE}")


if __name__ == "__main__":
    main()
