import logging
import os

import psycopg2

logger = logging.getLogger(__name__)


def load_checklist_from_db() -> dict:
    db_url = os.environ.get("SUPABASE_DB_URL", "")
    if not db_url:
        raise ValueError("SUPABASE_DB_URL ortam değişkeni tanımlı değil")

    conn = psycopg2.connect(db_url)
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT "Category", "Description", "Severity"
                FROM checklist_items
                WHERE "IsDeleted" = FALSE AND "IsActive" = TRUE
                ORDER BY "Id" ASC
                """
            )
            rows = cur.fetchall()
    finally:
        conn.close()

    categories = {}
    for category, description, severity in rows:
        if category not in categories:
            categories[category] = []
        categories[category].append({"check": description, "severity": severity})

    return {
        "categories": [
            {"name": name, "items": items}
            for name, items in categories.items()
        ]
    }


def save_review(
    branch: str,
    commit_sha: str,
    author: str,
    repo: str,
    push_title: str,
    report_html: str,
) -> None:
    db_url = os.environ.get("SUPABASE_DB_URL", "")
    if not db_url:
        raise ValueError("SUPABASE_DB_URL ortam değişkeni tanımlı değil")

    conn = psycopg2.connect(db_url)
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO reviews
                    ("Branch", "CommitSha", "Author", "Repo", "PushTitle", "ReportData",
                     "IsActive", "IsDeleted")
                VALUES (%s, %s, %s, %s, %s, %s, TRUE, FALSE)
                """,
                (branch, commit_sha, author, repo, push_title, report_html),
            )
        conn.commit()
        logger.info("Rapor Supabase'e kaydedildi.")
    finally:
        conn.close()
