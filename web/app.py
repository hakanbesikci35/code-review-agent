import uvicorn
import yaml
from fastapi import FastAPI, Form, Request
from fastapi.responses import RedirectResponse
from fastapi.templating import Jinja2Templates
from pathlib import Path

app = FastAPI(title="Code Review Checklist Manager")

TEMPLATES_DIR = Path(__file__).parent / "templates"
CHECKLIST_PATH = Path(__file__).parent.parent / "checklist.yaml"

templates = Jinja2Templates(directory=str(TEMPLATES_DIR))

SEVERITY_ORDER = ["critical", "high", "medium", "low"]


def read_checklist() -> dict:
    with open(CHECKLIST_PATH, "r", encoding="utf-8") as f:
        return yaml.safe_load(f)


def write_checklist(data: dict) -> None:
    with open(CHECKLIST_PATH, "w", encoding="utf-8") as f:
        yaml.dump(data, f, allow_unicode=True, default_flow_style=False, sort_keys=False)


def next_id(checklist: dict) -> int:
    max_id = 0
    for cat in checklist["categories"]:
        for item in cat["items"]:
            if item["id"] > max_id:
                max_id = item["id"]
    return max_id + 1


def count_stats(checklist: dict) -> dict:
    stats = {"total": 0, "critical": 0, "high": 0, "medium": 0, "low": 0}
    for cat in checklist["categories"]:
        for item in cat["items"]:
            stats["total"] += 1
            stats[item["severity"]] += 1
    return stats


@app.get("/")
async def index(request: Request):
    checklist = read_checklist()
    stats = count_stats(checklist)
    return templates.TemplateResponse(
        request,
        "index.html",
        {"checklist": checklist, "stats": stats, "severities": SEVERITY_ORDER},
    )


@app.post("/items/add")
async def add_item(
    category_name: str = Form(...),
    check: str = Form(...),
    severity: str = Form(...),
):
    checklist = read_checklist()
    new_item = {"id": next_id(checklist), "check": check, "severity": severity}
    for cat in checklist["categories"]:
        if cat["name"] == category_name:
            cat["items"].append(new_item)
            break
    write_checklist(checklist)
    return RedirectResponse("/", status_code=303)


@app.post("/items/update/{item_id}")
async def update_item(
    item_id: int,
    check: str = Form(...),
    severity: str = Form(...),
):
    checklist = read_checklist()
    for cat in checklist["categories"]:
        for item in cat["items"]:
            if item["id"] == item_id:
                item["check"] = check
                item["severity"] = severity
                break
    write_checklist(checklist)
    return RedirectResponse("/", status_code=303)


@app.post("/items/delete/{item_id}")
async def delete_item(item_id: int):
    checklist = read_checklist()
    for cat in checklist["categories"]:
        cat["items"] = [i for i in cat["items"] if i["id"] != item_id]
    write_checklist(checklist)
    return RedirectResponse("/", status_code=303)


@app.post("/categories/add")
async def add_category(category_name: str = Form(...)):
    checklist = read_checklist()
    checklist["categories"].append({"name": category_name, "items": []})
    write_checklist(checklist)
    return RedirectResponse("/", status_code=303)


@app.post("/categories/delete")
async def delete_category(category_name: str = Form(...)):
    checklist = read_checklist()
    checklist["categories"] = [c for c in checklist["categories"] if c["name"] != category_name]
    write_checklist(checklist)
    return RedirectResponse("/", status_code=303)


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)
