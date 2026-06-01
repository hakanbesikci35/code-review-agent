import os
import platform

import psycopg2
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))
import uvicorn
from io import BytesIO

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import Response
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from xhtml2pdf import pisa

app = FastAPI(title="Code Review API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


def _get_unicode_font_path() -> str:
    system = platform.system()
    candidates = []
    if system == 'Windows':
        candidates = [
            r'C:\Windows\Fonts\arial.ttf',
            r'C:\Windows\Fonts\calibri.ttf',
        ]
    else:
        candidates = [
            '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
            '/usr/share/fonts/dejavu/DejaVuSans.ttf',
            '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
        ]
    for path in candidates:
        if os.path.exists(path):
            return path
    return ''


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

        font_path = _get_unicode_font_path()
        if font_path and 'UnicodeFont' not in pdfmetrics.getRegisteredFontNames():
            pdfmetrics.registerFont(TTFont('UnicodeFont', font_path))

        font_style = """
        <style>
          body, table, td, th, p, h1, h2, h3, span, div, li {
            font-family: UnicodeFont, sans-serif !important;
          }
        </style>
        """ if font_path else ""
        html_content = row[0].replace('</head>', font_style + '</head>', 1)

        buf = BytesIO()
        pisa.CreatePDF(
            src=BytesIO(html_content.encode('utf-8')),
            dest=buf,
            encoding='utf-8'
        )
        pdf_bytes = buf.getvalue()
        return Response(
            content=pdf_bytes,
            media_type="application/pdf",
            headers={"Content-Disposition": f"attachment; filename=review_{review_id}.pdf"},
        )
    finally:
        conn.close()


# ---------------------------------------------------------------------------
# Checklist endpoints
# ---------------------------------------------------------------------------

@app.get("/checklist")
def list_checklist():
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                SELECT "Id", "Category", "Description", "Severity"
                FROM checklist_items
                WHERE "IsDeleted" = FALSE AND "IsActive" = TRUE
                ORDER BY "Id" ASC
                """
            )
            rows = cur.fetchall()
        return [
            {
                "id": str(r[0]),
                "category": r[1],
                "description": r[2],
                "severity": r[3],
            }
            for r in rows
        ]
    finally:
        conn.close()


@app.post("/checklist")
def create_checklist_item(body: dict):
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                INSERT INTO checklist_items ("Category", "Description", "Severity")
                VALUES (%s, %s, %s)
                RETURNING "Id"
                """,
                (body.get("category"), body.get("description"), body.get("severity")),
            )
            new_id = cur.fetchone()[0]
        conn.commit()
        return {"id": str(new_id), "category": body.get("category"), "description": body.get("description"), "severity": body.get("severity")}
    finally:
        conn.close()


@app.put("/checklist/{item_id}")
def update_checklist_item(item_id: int, body: dict):
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE checklist_items
                SET "Category" = %s, "Description" = %s, "Severity" = %s, "UpdatedDate" = NOW()
                WHERE "Id" = %s AND "IsDeleted" = FALSE
                """,
                (body.get("category"), body.get("description"), body.get("severity"), item_id),
            )
        conn.commit()
        return {"id": str(item_id), **body}
    finally:
        conn.close()


@app.delete("/checklist/{item_id}")
def delete_checklist_item(item_id: int):
    conn = get_conn()
    try:
        with conn.cursor() as cur:
            cur.execute(
                """
                UPDATE checklist_items
                SET "IsDeleted" = TRUE, "IsActive" = FALSE, "DeletedDate" = NOW()
                WHERE "Id" = %s
                """,
                (item_id,),
            )
        conn.commit()
        return {"success": True}
    finally:
        conn.close()


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
