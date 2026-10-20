# ⚙️ Swipe engine: code and runbook

Notion URL: https://app.notion.com/p/3fde983412b88167aa6fe07bed719759
Exported 2026-10-18

---

<callout icon="⚙️" color="gray_bg">
	The weekly run downloads the file below, unzips it and follows [README.md](http://README.md) inside. Don't rename or delete this page; the scheduled task finds it by title. When the private GitHub repo **daminisolanki1309-netizen/tagada-swipe-engine** is reachable, the run uses that instead and this file is the backup.
</callout>
<file src="notion-file-block://b4c339c2-2b2d-4c3d-86d7-b05a2b177c5e/7fb2956b-4bad-4868-905e-7a8b8ed866b8?space_id=a85e9834-12b8-81e2-8036-00034325c0ee&name=tagada-swipe-engine.zip">[tagada-swipe-engine.zip](http://tagada-swipe-engine.zip) (engine v1, Oct 18, 2026)</file>
## What's inside
- `engine/swipe_engine.js`: X, LinkedIn, Instagram and Meta Ad Library scans; link checks with screenshots and no-login views
- `engine/run.sh`: runs any command with the proxy settings the cloud container needs
- `engine/trim.py`: crops empty space off screenshots before upload
- `engine/voc_fetch.js`: pulls Trustpilot reviews and forum threads for the Voice of Customer table
- `README.md`: the runbook, including what each platform allows without a login
## Version log
- **v1, Oct 18, 2026:** first weekly run. Meta ads are read from the ad's own dialog; Instagram falls back to the post page when embedding is off; X and LinkedIn scans pace themselves to avoid rate limits.
