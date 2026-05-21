import logging
import os

import psycopg2

logger = logging.getLogger(__name__)


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
                    ("Branch", "CommitSha", "Author", "Repo", "PushTitle", "PdfData",
                     "IsActive", "IsDeleted")
                VALUES (%s, %s, %s, %s, %s, %s, TRUE, FALSE)
                """,
                (branch, commit_sha, author, repo, push_title, report_html),
            )
        conn.commit()
        logger.info("Rapor Supabase'e kaydedildi.")
    finally:
        conn.close()
