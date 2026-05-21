import os

import psycopg2
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))
import uvicorn
from io import BytesIO

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from xhtml2pdf import pisa

app = FastAPI(title="Code Review API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_conn():
    db_url = os.environ.get("SUPABASE_DB_URL", "")
    if not db_url:
        raise RuntimeError("SUPABASE_DB_URL ortam değişkeni tanımlı değil")
    return psycopg2.connect(db_url)


@app.get("/reviews")
def list_reviews():
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT "Id", "Branch", "CommitSha", "Author", "Repo", "PushTitle", "CreatedDate"
                FROM reviews
                WHERE "IsDeleted" = FALSE AND "IsActive" = TRUE
                ORDER BY "CreatedDate" DESC
                """
            )
            rows = cur.fetchall()
        return [
            {
                "id": r[0],
                "branch": r[1],
                "commitSha": r[2],
                "author": r[3],
                "repo": r[4],
                "pushTitle": r[5],
                "createdDate": r[6].isoformat() if r[6] else None,
            }
            for r in rows
        ]
    finally:
        conn.close()


@app.get("/reviews/{review_id}")
def get_review(review_id: int):
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT "Id", "Branch", "CommitSha", "Author", "Repo", "PushTitle", "ReportData", "CreatedDate"
                FROM reviews
                WHERE "Id" = %s AND "IsDeleted" = FALSE AND "IsActive" = TRUE
                """,
                (review_id,),
            )
            row = cur.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Rapor bulunamadı")
        return {
            "id": row[0],
            "branch": row[1],
            "commitSha": row[2],
            "author": row[3],
            "repo": row[4],
            "pushTitle": row[5],
            "reportHtml": row[6],
            "createdDate": row[7].isoformat() if row[7] else None,
        }
    finally:
        conn.close()


@app.get("/reviews/{review_id}/pdf")
def get_review_pdf(review_id: int):
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT "ReportData"
                FROM reviews
                WHERE "Id" = %s AND "IsDeleted" = FALSE AND "IsActive" = TRUE
                """,
                (review_id,),
            )
            row = cur.fetchone()
        if not row or not row[0]:
            raise HTTPException(status_code=404, detail="Rapor bulunamadı")
        buf = BytesIO()
        pisa.CreatePDF(row[0], dest=buf)
        pdf_bytes = buf.getvalue()
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=review_{review_id}.pdf"},
        )
    finally:
        conn.close()


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
