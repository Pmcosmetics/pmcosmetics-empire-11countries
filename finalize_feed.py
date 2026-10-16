import csv, os, shutil

base = "data/catalog/"
orig = base + "meta-commerce-feed-2026-10-15.csv"
kept_path = base + "meta-commerce-feed-2026-10-15.cosmetics.csv"
pending = base + "missing-37-pending-images.csv"

# Replace the feed with the filtered cosmetics-only rows (original stays in git history).
shutil.copyfile(kept_path, orig)
os.remove(kept_path)

with open(orig, newline="", encoding="utf-8") as f:
    rows = list(csv.DictReader(f))
with open(base + "meta-commerce-feed-2026-10-15.excluded.csv", newline="", encoding="utf-8") as f:
    excluded = list(csv.DictReader(f))
with open(pending, newline="", encoding="utf-8") as f:
    pend = list(csv.DictReader(f))

print("feed now:", len(rows), "rows")
print("excluded (audit file):", len(excluded))
print("pending 37:", len(pend))
for r in pend:
    print("  ", r["product_id"], "|", r["product"][:70], "|", r["brand"], "|", r["classification"])
