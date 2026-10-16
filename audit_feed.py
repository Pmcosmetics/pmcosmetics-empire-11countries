import csv, re
base = "data/catalog/"
def read(p):
    with open(p, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))
kept = read(base + "meta-commerce-feed-2026-10-15.csv")
ex = read(base + "meta-commerce-feed-2026-10-15.excluded.csv")

# 1) Excluded rows that look like cosmetics (false positives to rescue)
COSM = re.compile(r"\b(serum|cream|lotion|gel|cleanser|shampoo|conditioner|mask|sunscreen|spf|moisturi[sz]er|toner|deodorant|roll-?on|perfume|lipstick|foundation|mascara|nail|oil|scrub|soap|body wash|shower|hair|spray|mist)\b", re.I)
fp = [r for r in ex if COSM.search(r["title"]) and not re.search(r"lubricant|toothpaste|diaper|pads?\b|pantyliner|tampon|napkin|sanitary|condom|capsule|tablet|tab\b|syrup|supplement|omega|gummies|softgel|mct|ointment|oint\b|\bmg\b|\biu\b", r["title"], re.I)]
print("EXCLUDED but cosmetic-looking:", len(fp))
for r in fp[:150]:
    print("  ", r["title"][:70], "|", r["brand"], "|", r["exclusion_reason"])

# 2) Kept rows that look like medicine / supplement / device
MED = re.compile(r"\b(capsules?|tablets?|tabs?|caps?|gummies|softgels?|syrup|ointment|oint|film|supplement|vitamins? [bd]\d*|omega|fish oil|mg|mcg|iu|formula|milk|test strips?|glucose|pressure|thermometer|nebuli|inhal|drops|nasal|nicotine|pills?|dose)\b", re.I)
km = [r for r in kept if MED.search(r["title"])]
print("\nKEPT but medicine/supplement-looking:", len(km))
for r in km[:200]:
    print("  ", r["title"][:75], "|", r["brand"])
