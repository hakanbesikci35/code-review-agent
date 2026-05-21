import logging
import os
import re
import sys
from pathlib import Path

import markdown as md
import yaml

sys.path.insert(0, str(Path(__file__).parent))

from ai_client import AIClient
from email_client import send_email

# ---------------------------------------------------------------------------
# Logging
# ---------------------------------------------------------------------------
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%Y-%m-%d %H:%M:%S",
)
logger = logging.getLogger(__name__)

REPO_ROOT = Path(__file__).parent.parent
MAX_DIFF_SIZE = 12_000

TEST_PATTERNS = ("test_", "_test.", "/tests/", "/test/", "_spec.", "spec_")


# ---------------------------------------------------------------------------
# Loaders
# ---------------------------------------------------------------------------

def load_checklist() -> dict:
    with open(REPO_ROOT / "checklist.yaml", "r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def load_config() -> dict:
    with open(REPO_ROOT / "config.yaml", "r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def load_changed_files() -> list:
    files_path = Path("changed_files.txt")
    if not files_path.exists():
        return []
    with open(files_path, "r", encoding="utf-8") as f:
        return [line.strip() for line in f if line.strip()]


# ---------------------------------------------------------------------------
# Smart truncate
# ---------------------------------------------------------------------------

def smart_truncate(diff: str, max_chars: int = MAX_DIFF_SIZE) -> str:
    """
    diff --git bloklarına göre böl.
    Test dosyalarını sona at, karakter limitine sığanları ekle,
    limitin aşıldığı noktada dur ve kaç dosyanın kesildiğini bildir.
    """
    if len(diff) <= max_chars:
        return diff

    blocks = [b for b in re.split(r"(?=diff --git )", diff) if b.strip()]

    test_blocks = [b for b in blocks if any(p in b for p in TEST_PATTERNS)]
    regular_blocks = [b for b in blocks if b not in test_blocks]
    ordered = regular_blocks + test_blocks

    result = ""
    included = 0
    for block in ordered:
        if len(result) + len(block) <= max_chars:
            result += block
            included += 1
        else:
            remaining = max_chars - len(result)
            if remaining > 300:
                result += block[:remaining]
                result += "\n\n... (bu dosya kırpıldı — diff limiti aşıldı)\n"
            break

    skipped = len(blocks) - included
    if skipped > 0:
        result += f"\n\n--- Not: {skipped} dosya karakter limiti nedeniyle gösterilmedi ---\n"

    return result


def load_diff() -> str:
    diff_path = Path("diff.patch")
    if not diff_path.exists():
        return ""
    with open(diff_path, "r", encoding="utf-8", errors="replace") as f:
        content = f.read()
    return smart_truncate(content)


# ---------------------------------------------------------------------------
# Prompt builder
# ---------------------------------------------------------------------------

def build_checklist_text(checklist: dict) -> str:
    lines = []
    for category in checklist["categories"]:
        lines.append(f"\n**{category['name']}**")
        for item in category["items"]:
            lines.append(f"  - [{item['severity'].upper()}] {item['check']}")
    return "\n".join(lines)


def build_prompt(
    checklist: dict,
    diff: str,
    changed_files: list,
    pr_title: str,
    pr_author: str,
) -> tuple:
    """
    İki ayrı string döndürür: (system_prompt, user_prompt)
    """

    system_prompt = """Sen kıdemli bir yazılım mühendisi ve kod kalitesi uzmanısın.
Görevin Pull Request'teki kod değişikliklerini verilen checklist kriterlerine göre incelemek ve Türkçe rapor hazırlamaktır.

Uyman gereken kurallar:
- SADECE diff içinde gerçekten gördüğün sorunları raporla. Olmayan, varsayılan ya da tahmin ettiğin sorunları ekleme.
- Her bulgu için mutlaka dosya adını ve mümkünse satır numarasını belirt (örn: auth.py:42).
- Sorun tespit etmediğin kategorileri bulgular tablosuna ekleme.
- Pozitif bulgular da raporla: iyi yazılmış kısımları, güvenlik önlemlerini ve temiz yapıyı özellikle belirt.
- Tamamen temiz bir PR ise bunu açıkça ve olumlu bir dille ifade et.
- Objektif ve yapıcı ol. Kişisel yorum değil, teknik ve somut değerlendirme yap.
- Raporu her zaman Türkçe yaz."""

    checklist_text = build_checklist_text(checklist)
    files_str = ", ".join(changed_files) if changed_files else "Bilinmiyor"

    user_prompt = f"""Aşağıdaki Pull Request'i incele ve raporu hazırla.

## PR Bilgileri
- Başlık: {pr_title}
- Yazar: {pr_author}
- Değişen/Eklenen Dosyalar: {files_str}

## Kod Değişiklikleri (Git Diff)
```diff
{diff}
```

## Review Checklist
{checklist_text}

## Rapor Formatı

### Özet
Genel değerlendirme (3-4 cümle). Toplam kaç bulgu, hangi kategorilerde sorun var? Olumlu yönleri de belirt.

### Bulgular
| Dosya | Satır | Kural | Önem | Açıklama |
|-------|-------|-------|------|----------|
| dosya.py | 42 | Kural metni | CRITICAL/HIGH/MEDIUM/LOW | Açıklama |

### Olumlu Bulgular
İyi yazılmış, güvenli veya temiz kısımlar. (Yoksa bu bölümü çıkar.)

### Öneriler
Sorunları gidermek için somut, uygulanabilir öneriler (madde madde).

### Genel Değerlendirme
Bu PR için karar: **ONAYLANDI** / **DÜZELTME GEREKİYOR** / **REDDEDİLDİ**"""

    return system_prompt, user_prompt


# ---------------------------------------------------------------------------
# Formatters
# ---------------------------------------------------------------------------

def format_email_html(
    report: str,
    pr_title: str,
    pr_author: str,
    pr_number: str,
    repo_name: str,
    changed_files: list,
) -> str:
    files_str = ", ".join(changed_files) if changed_files else "Bilinmiyor"
    report_html = md.markdown(report, extensions=["tables", "fenced_code"])

    return f"""<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Code Review Raporu</title>
  <style>
    body  {{ font-family: Arial, sans-serif; max-width: 820px; margin: 0 auto; padding: 20px; color: #333; line-height: 1.6; }}
    table {{ border-collapse: collapse; width: 100%; margin: 16px 0; font-size: 14px; }}
    th    {{ background: #f0f0f0; padding: 8px 12px; text-align: left; border: 1px solid #ddd; }}
    td    {{ padding: 8px 12px; border: 1px solid #ddd; vertical-align: top; }}
    tr:nth-child(even) {{ background: #fafafa; }}
    code  {{ background: #f4f4f4; padding: 2px 5px; border-radius: 3px; font-size: 13px; font-family: monospace; }}
    pre   {{ background: #f4f4f4; padding: 12px; border-radius: 5px; overflow-x: auto; font-size: 13px; }}
    pre code {{ background: none; padding: 0; }}
    h2, h3 {{ color: #222; margin-top: 24px; }}
    blockquote {{ border-left: 4px solid #ccc; margin: 0; padding-left: 16px; color: #555; }}
  </style>
</head>
<body>

  <div style="background:#1a1a2e;color:white;padding:20px 25px;border-radius:8px 8px 0 0;">
    <h2 style="margin:0;font-size:20px;">Code Review Raporu</h2>
  </div>

  <div style="background:#f7f7f7;padding:15px 20px;border:1px solid #ddd;border-top:none;">
    <table style="margin:0;">
      <tr><td style="width:100px;"><strong>PR #:</strong></td><td>{pr_number}</td></tr>
      <tr><td><strong>Başlık:</strong></td><td>{pr_title}</td></tr>
      <tr><td><strong>Yazar:</strong></td><td>{pr_author}</td></tr>
      <tr><td><strong>Repo:</strong></td><td>{repo_name}</td></tr>
      <tr><td><strong>Dosyalar:</strong></td><td>{files_str}</td></tr>
    </table>
  </div>

  <div style="padding:25px;border:1px solid #ddd;border-top:none;background:white;">
    {report_html}
  </div>

  <p style="color:#aaa;font-size:11px;text-align:center;margin-top:15px;">
    Bu rapor Code Review Agent tarafından otomatik olarak oluşturulmuştur.
  </p>

</body>
</html>"""


# ---------------------------------------------------------------------------
# Main
# ---------------------------------------------------------------------------

def main():
    logger.info("Code Review Agent başlatılıyor...")

    config = load_config()
    checklist = load_checklist()
    diff = load_diff()
    changed_files = load_changed_files()

    event_name = os.environ.get("EVENT_NAME", "push")
    branch_name = os.environ.get("BRANCH_NAME", "unknown")
    commit_sha = os.environ.get("COMMIT_SHA", "")[:7]
    pr_title = os.environ.get("PR_TITLE", "Başlıksız PR")
    pr_author = os.environ.get("PR_AUTHOR", "Bilinmiyor")
    pr_number = os.environ.get("PR_NUMBER", "0")
    repo_name = os.environ.get("REPO_NAME", "")
    ai_api_key = os.environ.get("AI_API_KEY", "")
    gmail_user = os.environ.get("GMAIL_USER", "")
    gmail_password = os.environ.get("GMAIL_APP_PASSWORD", "")
    review_email = os.environ.get("REVIEW_EMAIL", "")

    is_pr = event_name == "pull_request"

    if not diff:
        logger.warning("Diff bulunamadı, işlem sonlandırılıyor.")
        sys.exit(0)

    if is_pr:
        logger.info(f"[PR] #{pr_number} inceleniyor: '{pr_title}' — yazar: {pr_author}")
    else:
        logger.info(f"[PUSH] branch: {branch_name} — commit: {commit_sha} — yazar: {pr_author}")
    logger.info(f"Değişen dosyalar ({len(changed_files)}): {changed_files}")

    system_prompt, user_prompt = build_prompt(
        checklist, diff, changed_files, pr_title, pr_author
    )

    client = AIClient(
        provider=config["ai_provider"],
        model=config["ai_model"],
        api_key=ai_api_key,
    )

    # --- AI Review ---
    report = None
    try:
        logger.info(f"AI review başlatılıyor ({config['ai_provider']} / {config['ai_model']})...")
        report = client.review(system_prompt, user_prompt)
        logger.info("AI review tamamlandı.")
    except Exception as exc:
        logger.error(f"AI review başarısız oldu: {exc}")
        sys.exit(1)

    # --- E-posta ---
    try:
        if is_pr:
            email_subject = f"[Code Review] PR #{pr_number} — {pr_title}"
            email_title = pr_title
            email_ref = f"PR #{pr_number}"
        else:
            email_subject = f"[Code Review] Push — {branch_name} ({commit_sha})"
            email_title = pr_title  # commit mesajı
            email_ref = f"Push / {branch_name} @ {commit_sha}"

        email_body = format_email_html(
            report, email_title, pr_author, email_ref, repo_name, changed_files
        )
        send_email(
            sender=gmail_user,
            password=gmail_password,
            recipient=review_email,
            subject=email_subject,
            body=email_body,
        )
        logger.info(f"Rapor maili gönderildi → {review_email}")
    except Exception as exc:
        logger.error(f"Mail gönderilemedi: {exc}")

    logger.info("İşlem tamamlandı.")


if __name__ == "__main__":
    main()
