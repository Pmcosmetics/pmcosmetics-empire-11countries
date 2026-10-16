import csv, re, collections

base = "data/catalog/"
FEED = base + "meta-commerce-feed-2026-10-15.csv"
MERGED = base + "pm-cosmetics-hub-alfouad-merged-2026-10-15.csv"

with open(FEED, newline="", encoding="utf-8-sig") as f:
    feed = list(csv.DictReader(f))
    feed_fields = list(csv.DictReader(open(FEED, newline="", encoding="utf-8-sig")).fieldnames)
with open(MERGED, newline="", encoding="utf-8-sig") as f:
    merged = list(csv.DictReader(f))

feed_ids = {r["id"].strip() for r in feed}
missing = [r for r in merged if r["product_id"].strip() not in feed_ids]

# ---- Non-cosmetic: brands that are medicines, supplements, devices, baby/hygiene, intimate ----
DROP_BRANDS = {
    # supplements / vitamins / sports nutrition
    "Bloom Ville", "Natrol", "Now Foods", "Puritan’s Pride", "NEOCELL", "Nature's Way", "Centrum",
    "Vitacare", "SofiLife", "Muscle Add", "Novogen Mass Gainer", "Novogen", "Ax Muscle", "Compenso",
    "Kolagra", "Kolagra off", "Perfectil", "Top Margen", "OMEGALOX", "PARASIDOSE", "PRIORIN", "Iron C",
    "melatime", "Planet Health", "NUTRIVILLE", "Well", "Self", "Joypox", "Rossmax", "Sanotact",
    "Sanso", "Sanosan", "AMS", "Dozova", "Meditopic", "Soralone", "Bundle", "Innox",
    # medicines (Rx / OTC) and weight-loss / sexual-health drugs
    "Panadol", "Telfast", "Strepsils", "Bronchicum", "Congestal", "Nerhasilda", "Movelex", "Nitolic",
    "Licid", "Flagoshown", "Sepalafil", "Cialis", "Wegovy", "Mounjaro", "ozempic", "RYBELSUS",
    "Minoxilook", "Ectomethrin", "Pirlome", "Regaine", "Hydrensa", "Influvac", "Nicorette", "Dax",
    "Versapenia", "Virecta", "Fuchs", "Fuchs Care", "Euceri", "Telfast", "Finjuve", "BioFreeze",
    "Intuition", "Kamino Moto", "Flurest", "GTT", "Eva Skincare", "Eva Senses", "Eva", "Evaneotrim",
    "Fari Krem", "Biski Krem", "Nawras", "Sorciere", "TIMOUNI", "Unik-in", "Medel",
    # devices / glucose meters / BP & health appliances
    "ACCU-CHEK", "BEURER", "Ritex", "Clary", "Tetra Glow", "Compenso", "Infinity",
    # baby / infant / diapers / hygiene / intimate
    "Aptamil", "Bebelac", "Nan", "S-26", "similac", "Happies Baby", "Canpol Babies", "pediamil",
    "Molfix", "Baby Joy", "Super kids", "Profi Kids", "Bubbles", "LUCKY OWL", "ALWAYS", "sofy",
    "care free", "Lady Speed", "Durex", "Control", "Intimate-Wellness", "Intimate Wellness",
    "Seropipe", "Dear", "DEAR", "DEAR offer", "Sani",
    "signal", "signal off", "sensodyne", "Close Up", "Close Up off", "Listerine", "Clear" if False else "__none__",
    "Glamy Lab" if False else "__none__", "Tresemme off" if False else "__none__",
}
DROP_BRANDS.discard("__none__")
# any non-cosmetic keyword in the title / description (supplements, drugs, devices, hygiene)
DROP_RE = re.compile(
    r"\b(tablets?|tabs?|capsules?|caps|softgels?|syrup|injection|ampoules?\s*\d*\s*mg|dietary supplement|"
    r"supplement|multivitamin|omega|probiotic|protein powder|creatine|mass gainer|"
    r"diapers?|pampers|sanitary|pads?\b|napkins?|pantyliner|condoms?|lubricant|contraceptive|"
    r"glucose|test strips?|lancets?|blood pressure|thermometer|nebuliz|inhaler|antibiotic|"
    r"paracetamol|ibuprofen|antihistamine|pain reliever|decongestant|mg\b|mcg|iu\b|formula milk|"
    r"infant formula|baby milk|milk\s*\(|\bmilk\b\s*\d|\bfollow[- ]on\b|hormone|semaglutide|tirzepatide|"
    r"prescription|rx only|mouthwash|toothpaste|tooth paste|dental|hearing|pregnancy test)\b",
    re.I,
)
# cosmetic / personal-care signals that override a weak drop hit (e.g. "vitamin C serum")
KEEP_RE = re.compile(
    r"\b(serum|cream|lotion|gel|cleanser|cleansing|foam|shampoo|conditioner|hair mask|mask|sunscreen|spf|"
    r"moisturi[sz]er|toner|deodorant|roll-on|body mist|mist|perfume|fragrance|eau de|lipstick|foundation|"
    r"mascara|eyeliner|concealer|blush|powder|nail|polish|oil|scrub|peel|soap|bar|spray|shower|bath|"
    r"hair (color|colour|dye)|dye|tonic|lash|eyelash|body milk|body wash|wax|razor|shaver|epilat|"
    r"dry shampoo|styling|mousse|hair spray|bodywash|face|skin|hair|makeup|make-up)\b",
    re.I,
)
DRUG_TITLE_OVERRIDE = re.compile(r"\b(tablets?|tabs?|capsules?|caps|syrup|injection|mg)\b", re.I)


def classify(r):
    brand = (r.get("brand") or "").strip()
    title = (r.get("title") or "")
    desc = (r.get("description") or "")
    text = f"{title} {desc[:400]}"
    if brand.lower() in {b.lower() for b in DROP_BRANDS} or brand.lower() in {"nicorette", "limitless", "renu", "clear men"}:
        return "drop", f"brand:{brand}"
    if re.search(r"nicotine|nicorette|sachets?\b|stick packs?|gummies|chromax|fortalase|baby d\b|contact lens|renu\b|\bdrops\b", title, re.I):
        return "drop", "title:supplement/medicine/device"
    if DRUG_TITLE_OVERRIDE.search(title):
        return "drop", "title:medicine/supplement form"
    m = DROP_RE.search(title)
    if m:
        return "drop", f"title:{m.group(0).lower()}"
    m = DROP_RE.search(desc[:200])
    if m and not KEEP_RE.search(title):
        return "drop", f"desc:{m.group(0).lower()}"
    return "keep", ""


kept, dropped = [], []
reasons = collections.Counter()
for r in feed:
    verdict, why = classify(r)
    if verdict == "keep":
        kept.append(r)
    else:
        dropped.append((r, why))
        reasons[why.split(":")[0]] += 1

with open(base + "meta-commerce-feed-2026-10-15.cosmetics.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=feed_fields, lineterminator="\r\n")
    w.writeheader()
    w.writerows(kept)

with open(base + "meta-commerce-feed-2026-10-15.excluded.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=feed_fields + ["exclusion_reason"], lineterminator="\r\n")
    w.writeheader()
    for r, why in dropped:
        w.writerow({**r, "exclusion_reason": why})

with open(base + "missing-37-pending-images.csv", "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=list(merged[0].keys()) + ["classification"], lineterminator="\r\n")
    w.writeheader()
    for r in missing:
        v, why = classify({"brand": r["brand"], "title": r["product"], "description": r["description"]})
        w.writerow({**r, "classification": v + (f" ({why})" if why else "")})

print("feed rows:", len(feed))
print("kept (cosmetics):", len(kept))
print("excluded:", len(dropped), dict(reasons))
print("missing from feed (merged-only):", len(missing))

print("\n-- kept brands (top 120) --")
kb = collections.Counter(r["brand"] for r in kept)
print(", ".join(f"{b}:{n}" for b, n in kb.most_common(120)))
print("\n-- excluded brands --")
eb = collections.Counter(r["brand"] for r, _ in dropped)
print(", ".join(f"{b}:{n}" for b, n in eb.most_common(200)))
