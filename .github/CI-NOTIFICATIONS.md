# CI failure notifications

The `Notify CI failures` workflow listens for failed runs of `PM Cosmetics CI`. It also supports a manual **Dry Run** through the GitHub Actions UI.

## Running a Dry Run

1. Open **Actions → Notify CI failures**.
2. Select **Run workflow** on the `main` branch.
3. Choose `both`, `slack`, or `email`.
4. Click **Run workflow**.

The manual run sends a fixed message with a `[DRY RUN]` label. It uses the same repository secrets as production failure notifications, but it does not run a build, deploy, push commits, or change Gate state.

## Required GitHub Actions secrets

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

If a requested channel is not configured completely, that channel is skipped and the run reports the missing configuration. For pull requests from forks, GitHub does not expose repository secrets to workflows; notifications are expected to be unavailable for those runs.
