import csv, re
base = "data/catalog/"
with open(base + "meta-commerce-feed-2026-10-15.excluded.csv", newline="", encoding="utf-8") as f:
    ex = list(csv.DictReader(f))
COSM = re.compile(r"\b(serum|cream|lotion|gel|cleanser|shampoo|conditioner|mask|sunscreen|spf|moisturi[sz]er|toner|deodorant|roll-?on|perfume|lipstick|foundation|mascara|nail|oil|scrub|soap|body wash|shower|bath|hair)\b", re.I)
hits = [r for r in ex if COSM.search(r["title"])]
print("excluded rows that look cosmetic:", len(hits))
for r in hits[:200]:
    print("  ", r["title"][:70], "|", r["brand"], "|", r["exclusion_reason"])
