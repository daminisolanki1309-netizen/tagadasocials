# Scheduled tasks

Scheduled tasks on claude.ai/code run this engine. Their full instructions are in this folder, so they can be recreated anywhere.

| Task | When | Instructions |
| --- | --- | --- |
| Scooby daily swipe drop | Every day, 8:45am IST (`CRON_TZ=Asia/Kolkata 45 8 * * *`, which is 03:15 UTC) | [daily-swipe-drop.md](daily-swipe-drop.md) |
| (old) Tagada weekly swipe drop | replaced by the daily drop on Oct 18 | [weekly-swipe-drop.md](weekly-swipe-drop.md) |
| Tagada calendar: find references and write copy | Only when started (after a calendar is pasted in the Calendar Inbox) | [calendar-references.md](calendar-references.md) |

Each needs the Notion connector and this repository (daminisolanki1309-netizen/tagadasocials) attached to the task. Nothing posts to Slack and nothing is emailed. Each run starts a fresh session, gets the engine from this repo (or from the zip on the Notion page "Swipe engine: code and runbook" if the repo can't be reached), and adds to Notion (the Scooby Runs page, newest run at the top) without touching earlier runs.
