# CI failure notifications

The `Notify CI failures` workflow listens for failed runs of `PM Cosmetics CI`. It sends Slack and email notifications independently, so one channel can remain unavailable without preventing the other from being attempted.

Configure these **GitHub Actions repository secrets**; never commit their values:

| Channel | Secret | Purpose |
|---|---|---|
| Slack | `SLACK_WEBHOOK_URL` | Slack incoming-webhook URL |
| SMTP | `SMTP_HOST` | SMTP server hostname |
| SMTP | `SMTP_PORT` | SMTP TLS port, commonly `465` or `587` according to the provider |
| SMTP | `SMTP_USERNAME` | SMTP username |
| SMTP | `SMTP_PASSWORD` | SMTP password or app password |
| Email | `ALERT_FROM` | Sender address permitted by the SMTP account |
| Email | `ALERT_TO` | Team recipient address or comma-separated recipients |

If a channel is not configured completely, that channel is skipped. The workflow does not create deployments, push commits, alter Gate state, or access product data.

For pull requests from forks, GitHub does not expose repository secrets to the workflow; notifications are therefore expected to be unavailable for those runs.
