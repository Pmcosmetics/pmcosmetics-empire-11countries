cat > apply_to_pmcosmetics_hub.sh <<‘EOF’#!/usr/bin/env bashset -euo pipefail

REPO=“Pmcosmetics/pmcosmetics-hub-11-countries”BRANCH=“chore/scaffold-and-audit”COMMIT_MSG=“chore: add scaffold (LICENSE, README, CODEOWNERS, templates) and audit workflow”PR_TITLE=“chore: repo scaffold + audit workflow”PR_BODY=“Add MIT license, README, CODEOWNERS, issue/pr templates, CI, and Repository Audit workflow (produces audit-output.zip). After merge run the workflow to collect audit artifacts.”

prereqs

command -v gh >/dev/null 2>&1 || { echo “gh CLI not found”; exit 1; }command -v git >/dev/null 2>&1 || { echo “git not found”; exit 1; }if [ -z “${AUDIT_PAT:-}” ]; then echo “Please export AUDIT_PAT before running”; exit 1; fi

add secret AUDIT_PAT to repo

echo -n “$AUDIT_PAT” | gh secret set AUDIT_PAT –repo “$REPO” –body -

clone repo and create branch

tmpdir=$(mktemp -d)git clone –depth 1 “git@github.com:${REPO}.git” “$tmpdir”cd “$tmpdir”git checkout -b “$BRANCH” || git checkout -B “$BRANCH”

add LICENSE if missing

if [ ! -f “LICENSE” ]; thencat > LICENSE <<‘L’MIT License

Copyright (c) 2026 Pmcosmetics

Permission is hereby granted, free of charge, to any person obtaining a copyof this software and associated documentation files (the “Software”), to dealin the Software without restriction…Lgit add LICENSEfi

add README if missing

if [ ! -f “README.md” ]; thencat > README.md <<‘R’

PM Cosmetics — pmcosmetics-hub-11-countries

Central repo for product feeds, front-end templates and GitHub Pages for 11 countries.See .github for contribution & CI.Rgit add README.mdfi

CODEOWNERS

mkdir -p .github/ISSUE_TEMPLATE .github/workflowscat > .github/CODEOWNERS <<‘C’

Default owners — replace with actual team or usernames

/* @Pmcosmetics/ownersCgit add .github/CODEOWNERS

ISSUE template

cat > .github/ISSUE_TEMPLATE/bug_report.md <<‘I’

name: Bug reportabout: Create a report to help us improvetitle: “[BUG] “labels: bug

Steps to reproduce1.

Expected behavior

Actual behaviorIgit add .github/ISSUE_TEMPLATE/bug_report.md

PR template

cat > .github/PULL_REQUEST_TEMPLATE.md <<‘P’

Summary

What change does this PR introduce?

Checklist

• Tests/validation passed

• Lint/format passed

• Documentation updated if neededPgit add .github/PULL_REQUEST_TEMPLATE.md

basic CI workflow (HTML validation)

cat > .github/workflows/ci.yml <<‘Y’name: CI — HTML validation

on:pull_request:branches: [ main ]push:branches: [ main ]

jobs:validate-html:runs-on: ubuntu-lateststeps:- uses: actions/checkout@v4- name: Install tidyrun: sudo apt-get update && sudo apt-get install -y tidy- name: Validate HTMLrun: |files=$(git ls-files ‘*.html’ || true)if [ -z “$files” ]; thenecho “No HTML files to validate.”exit 0fifailed=0for f in $files; dotidy -e “$f” || failed=1doneif [ “$failed” -ne 0 ]; thenecho “HTML validation failed.”exit 1fiYgit add .github/workflows/ci.yml

audit workflow (creates audit-output.zip)

cat > .github/workflows/audit.yml <<‘A’name: Repository Auditon:workflow_dispatch:inputs:users:description: ‘Comma-separated GitHub usernames to audit’required: truedefault: ‘Shukrypeter79-max,Shukrypeter102-arch’

jobs:audit:runs-on: ubuntu-lateststeps:- uses: actions/checkout@v4- name: Install depsrun: sudo apt-get update && sudo apt-get install -y jq zip curl git gh- name: Authenticate gh with PATenv:GITHUB_TOKEN_INPUT: ${{ secrets.AUDIT_PAT }}run: echo “$GITHUB_TOKEN_INPUT” | gh auth login –with-token- name: Create and run audit scriptrun: |cat > audit_accounts.sh <<‘EOF’#!/usr/bin/env bashset -euo pipefailif [ $# -lt 1 ]; then echo “Usage: $0 username1 [username2 …]”; exit 1; fifor USER in “$@”; doOUTDIR=“audit_output/${USER}”mkdir -p “$OUTDIR”gh api users/”$USER” –jq ‘.’ > “$OUTDIR/user.json” || echo “{}” > “$OUTDIR/user.json”gh repo list “$USER” –limit 1000 –json name,fullName,visibility,sshUrl,url,description,updatedAt,createdAt,defaultBranch,fork,parentNameWithOwner > “$OUTDIR/repos.json”gh api repos/”$REPO” –jq ‘.’ > “$OUTDIR/repo_info.json” || truegh api repos/”$REPO”/collaborators –jq ‘[ .[] | {login:.login,permissions:.permissions} ]’ > “$OUTDIR/repo_collaborators.json” || echo “[]” > “$OUTDIR/repo_collaborators.json”gh api repos/”$REPO”/keys –jq ‘[ .[] | {id:.id,title:.title,read_only:.read_only} ]’ > “$OUTDIR/repo_deploykeys.json” || echo “[]” > “$OUTDIR/repo_deploykeys.json”gh api repos/”$REPO”/hooks –jq ‘[ .[] | {id:.id,config:.config,events:.events,active:.active} ]’ > “$OUTDIR/repo_webhooks.json” || echo “[]” > “$OUTDIR/repo_webhooks.json”gh api repos/”$REPO”/actions/secrets –jq ‘{secrets: .secrets, total_count:.total_count}’ > “$OUTDIR/repo_secrets.json” || echo ‘{ “secrets”: [], “total_count”: 0 }’ > “$OUTDIR/repo_secrets.json”gh api repos/”$REPO”/branches –jq ‘[ .[] | {name:.name,protected:.protected} ]’ > “$OUTDIR/repo_branches.json” || echo “[]” > “$OUTDIR/repo_branches.json”gh api repos/”$REPO”/actions/runners –jq ‘.’ > “$OUTDIR/repo_runners.json” || echo “{}” > “$OUTDIR/repo_runners.json”doneEOFchmod +x audit_accounts.shIFS=’,’ read -ra USERS <<< “${{ github.event.inputs.users }}”./audit_accounts.sh “${USERS[@]}”- name: Zip resultsrun: zip -r audit_output.zip audit_output || true- name: Upload artifactuses: actions/upload-artifact@v4with:name: audit-outputpath: audit_output.zipAgit add .github/workflows/audit.yml

commit & push & open PR

git commit -m “$COMMIT_MSG” || truegit push –set-upstream origin “$BRANCH”gh pr create –repo “$REPO” –title “$PR_TITLE” –body “$PR_BODY” –base main

echo “PR created: check https://github.com/${REPO}/pulls”cd ..rm -rf “$tmpdir”EOF

chmod +x apply_to_pmcosmetics_hub.sh./apply_to_pmcosmetics_hub.sh