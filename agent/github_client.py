import requests


def post_pr_comment(repo: str, pr_number: str, comment: str, token: str) -> None:
    url = f"https://api.github.com/repos/{repo}/issues/{pr_number}/comments"
    headers = {
        "Authorization": f"Bearer {token}",
        "Accept": "application/vnd.github.v3+json",
        "X-GitHub-Api-Version": "2022-11-28",
    }
    response = requests.post(url, json={"body": comment}, headers=headers)
    response.raise_for_status()
    print(f"GitHub PR yorumu eklendi: PR #{pr_number}")
