import os
import sys
import yaml
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

from ai_client import AIClient
from github_client import post_pr_comment
from email_client import send_email

REPO_ROOT = Path(__file__).parent.parent
MAX_DIFF_SIZE = 12000


def load_checklist() -> dict:
    with open(REPO_ROOT / "checklist.yaml", "r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def load_config() -> dict:
    with open(REPO_ROOT / "config.yaml", "r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def load_diff() -> str:
    diff_path = Path("diff.patch")
    if not diff_path.exists():
        return ""
    with open(diff_path, "r", encoding="utf-8", errors="replace") as f:
        content = f.read()
    if len(content) > MAX_DIFF_SIZE:
        content = content[:MAX_DIFF_SIZE] + "\n\n... (diff kısaltıldı, boyut limiti aşıldı)"
    return content


def load_changed_files() -> list:
    files_path = Path("changed_files.txt")
    if not files_path.exists():
        return []
    with open(files_path, "r", encoding="utf-8") as f:
        return [line.strip() for line in f if line.strip()]


def build_checklist_text(checklist: dict) -> str:
    lines = []
    for category in checklist["categories"]:
        lines.append(f"\n**{category['name']}**")
        for item in category["items"]:
            lines.append(f"  - [{item['severity'].upper()}] {item['check']}")
    return "\n".join(lines)


def build_prompt(checklist: dict, diff: str, changed_files: list, pr_title: str, pr_author: str) -> str:
    checklist_text = build_checklist_text(checklist)
    files_str = ", ".join(changed_files) if changed_files else "Bilinmiyor"

    return f"""Sen bir kıdemli yazılım mühendisi ve kod kalitesi uzmanısın.
Aşağıdaki pull request'i, verilen checklist kriterlerine göre detaylıca incele.

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
Aşağıdaki yapıda Türkçe bir rapor hazırla:

### Özet
Genel değerlendirme (3-4 cümle). Toplam kaç bulgu tespit edildi, hangi kategorilerde sorun var?

### Bulgular
Her tespit ettiğin sorun için tablo oluştur:
| Dosya | Kural | Önem | Açıklama |
|-------|-------|------|----------|
| dosya.py | Kural metni | CRITICAL/HIGH/MEDIUM/LOW | Kısa açıklama |

Sorun tespit etmediğin kategorileri tabloya ekleme.

### Öneriler
Sorunları gidermek için somut, uygulanabilir öneriler (madde madde).

### Genel Değerlendirme
Bu PR için karar: **ONAYLANDI** / **DÜZELTME GEREKİYOR** / **REDDEDİLDİ**

---
Sadece diff'te gerçekten gördüğün sorunları raporla. Tespit etmediğin sorunları uydurma."""


def format_github_comment(report: str, pr_title: str, changed_files: list) -> str:
    files_str = ", ".join(f"`{f}`" for f in changed_files) if changed_files else "Bilinmiyor"
    return f"""## :robot: Code Review Raporu

**PR:** {pr_title}
**İncelenen Dosyalar:** {files_str}

---

{report}

---
*Bu rapor [Code Review Agent](../blob/main/agent/reviewer.py) tarafından otomatik oluşturulmuştur.*"""


def format_email_html(
    report: str,
    pr_title: str,
    pr_author: str,
    pr_number: str,
    repo_name: str,
    changed_files: list,
) -> str:
    files_str = ", ".join(changed_files) if changed_files else "Bilinmiyor"
    report_escaped = report.replace("<", "&lt;").replace(">", "&gt;")

    return f"""<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Code Review Raporu</title></head>
<body style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; color: #333;">

  <div style="background: #1a1a2e; color: white; padding: 20px 25px; border-radius: 8px 8px 0 0;">
    <h2 style="margin: 0; font-size: 20px;">Code Review Raporu</h2>
  </div>

  <div style="background: #f7f7f7; padding: 15px 20px; border: 1px solid #ddd; border-top: none;">
    <table style="width: 100%; border-collapse: collapse;">
      <tr><td style="padding: 5px 10px; width: 120px;"><strong>PR #:</strong></td><td style="padding: 5px;">{pr_number}</td></tr>
      <tr><td style="padding: 5px 10px;"><strong>Başlık:</strong></td><td style="padding: 5px;">{pr_title}</td></tr>
      <tr><td style="padding: 5px 10px;"><strong>Yazar:</strong></td><td style="padding: 5px;">{pr_author}</td></tr>
      <tr><td style="padding: 5px 10px;"><strong>Repo:</strong></td><td style="padding: 5px;">{repo_name}</td></tr>
      <tr><td style="padding: 5px 10px;"><strong>Dosyalar:</strong></td><td style="padding: 5px;">{files_str}</td></tr>
    </table>
  </div>

  <div style="padding: 25px; border: 1px solid #ddd; border-top: none; background: white; white-space: pre-wrap; line-height: 1.7; font-size: 14px;">
{report_escaped}
  </div>

  <p style="color: #aaa; font-size: 11px; text-align: center; margin-top: 15px;">
    Bu rapor Code Review Agent tarafından otomatik olarak oluşturulmuştur.
  </p>
</body>
</html>"""


def main():
    print("Code Review Agent başlatılıyor...")

    config = load_config()
    checklist = load_checklist()
    diff = load_diff()
    changed_files = load_changed_files()

    pr_title = os.environ.get("PR_TITLE", "Başlıksız PR")
    pr_author = os.environ.get("PR_AUTHOR", "Bilinmiyor")
    pr_number = os.environ.get("PR_NUMBER", "0")
    repo_name = os.environ.get("REPO_NAME", "")
    ai_api_key = os.environ.get("AI_API_KEY", "")
    gmail_user = os.environ.get("GMAIL_USER", "")
    gmail_password = os.environ.get("GMAIL_APP_PASSWORD", "")
    review_email = os.environ.get("REVIEW_EMAIL", "")
    github_token = os.environ.get("GITHUB_TOKEN", "")

    if not diff:
        print("Diff bulunamadı, işlem sonlandırılıyor.")
        sys.exit(0)

    print(f"PR #{pr_number} inceleniyor: {pr_title}")
    print(f"Değişen dosyalar: {changed_files}")

    prompt = build_prompt(checklist, diff, changed_files, pr_title, pr_author)

    client = AIClient(
        provider=config["ai_provider"],
        model=config["ai_model"],
        api_key=ai_api_key,
    )

    print(f"AI review başlatılıyor ({config['ai_provider']} - {config['ai_model']})...")
    report = client.review(prompt)
    print("AI review tamamlandı.")

    github_comment = format_github_comment(report, pr_title, changed_files)
    post_pr_comment(repo_name, pr_number, github_comment, github_token)

    email_body = format_email_html(report, pr_title, pr_author, pr_number, repo_name, changed_files)
    send_email(
        sender=gmail_user,
        password=gmail_password,
        recipient=review_email,
        subject=f"[Code Review] PR #{pr_number} - {pr_title}",
        body=email_body,
    )

    print("Tamamlandi! GitHub yorumu ve mail gönderildi.")


if __name__ == "__main__":
    main()
