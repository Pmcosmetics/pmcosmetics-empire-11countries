"""Filter the Meta commerce feed down to cosmetics/personal care.
Drops medicines, supplements, infant formula, medical devices, diapers and
feminine care, intimate/lubricant products and oral care.
Source of truth: meta-commerce-feed-2026-10-15.original.csv (4922 rows).
Writes the cosmetics feed and an audit file listing every removed row."""
import csv, re, collections, os

base = "data/catalog/"
FEED = base + "meta-commerce-feed-2026-10-15.csv"
EXCL = base + "meta-commerce-feed-2026-10-15.excluded.csv"
BACKUP = base + "meta-commerce-feed-2026-10-15.original.csv"
FIELDS = ['id', 'title', 'description', 'availability', 'condition', 'price', 'link', 'image_link', 'brand']


def read(p):
    with open(p, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


original = read(BACKUP)

# Brands that are not cosmetics: medicines, supplements, formula, devices, diapers,
# feminine care, intimate/lubricants, oral care.
BLOCK_BRANDS = {
    "now foods", "puritan’s pride", "puritan's pride", "natrol", "nature's way", "neocell", "centrum",
    "vitacare", "sofilife", "muscle add", "compenso", "perfectil", "omegalox",
    "parasidose", "priorin", "iron c", "planet health", "nutriville", "novogen", "novogen mass gainer",
    "well", "self", "joypox", "rossmax", "sanotact", "ams", "dozova", "bundle", "unik-in", "bloom ville",
    "pirlome", "phyto", "sanso", "top margen", "tulangoslim",
    "panadol", "telfast", "strepsils", "bronchicum", "congestal", "nerhasilda", "movelex", "nitolic",
    "licid", "flagoshown", "sepalafil", "cialis", "wegovy", "mounjaro", "ozempic", "rybelsus",
    "minoxilook", "ectomethrin", "regaine", "influvac", "nicorette", "biofreeze", "versapenia", "virecta",
    "fuchs", "fuchs care", "gtt", "evaneotrim", "dg", "timouni", "sorciere", "accu-chek", "beurer", "medel",
    "ritex", "control", "durex", "intimate-wellness", "intimate wellness", "aptamil", "bebelac", "similac",
    "nan", "s-26", "happies baby", "pediamil", "canpol babies", "molfix", "baby joy", "private", "always",
    "sofy", "care free", "sensodyne", "close up", "close up off", "listerine", "all vent", "signal", "signal off",
    "limitless", "k-y", "biofreeze", "nicorette", "regaine", "licid", "ectomethrin", "movelex", "fuchs care",
    "neocell", "nature's way", "natrol", "timouni", "intimate-wellness",
}

# Brands that are cosmetic/personal care even if a title-keyword rule would fire.
RESCUE_BRANDS = {"dear", "kolagra", "kolagra off", "sorciere", "sorcier", "top margen", "bundle"}

# Medicine / supplement / device / hygiene product forms in the title.
BLOCK_TITLE = re.compile(
    r"\b("
    r"stopadol|panadol|terramycin|mebo|neocarbon|mercazole|amipride|amiprostone|seleno|spascolon|zolm|"
    r"barcimiant|bio legam|congestal|telfast|nicorette|nicotine|bronchicum|strepsils|pectol|"
    r"infant formula|formula milk|milk powder|growing[- ]up milk|follow[- ]on milk|nutrition powder|"
    r"bebelac|aptamil|similac|test strips?|blood glucose|glucose strips?|blood pressure|thermometer|"
    r"nebuli[sz]er|inhaler|physiomer|nasal aspirator|nasal bulb|ice bag|pampers|molfix|"
    r"supplement|multivitamin|dietary|omega-?3|fish oil|gummies|softgels?|capsules?|tablets?|tabs?|"
    r"syrup|ointment|oint|film|b complex|b-complex|coenzyme|mct oil|"
    r"toothpaste\w*|tooth ?brush\w*|mouth ?wash\w*|lubricant|condoms?|pantyliners?|tampons?|napkins?|sanitary|"
    r"diaper\w*|diaper ?rash|pads|sanso|vitamin d3|sibionics|glucose monitoring|biski krem|fari krem|cereal|"
    r"breast milk|hero|nido|pediasure|resource junior|nan|optipro|s-?26|pediamil|lf milk|infant milk|"
    r"k-y|jelly|minoxidil|nitolic prevent|head lice|lice|scabies|sanitizing|sanitiser|sanitizer|mounjaro|tirzepatide|semaglutide|wegovy|ozempic|rybelsus"
    r")\b"
    r"|\bmilk\s*\(\s*\d"
    r"|\b\d+\s*(tabs?|caps?|tablets?|capsules?)\b"
    r"|\b\d+\s*(mcg|iu)\b"
    r"|\bhair\s*(skin|&|and)\s*nails?\b",
    re.I,
)

# Strong cosmetic words: used to rescue title-only false hits such as "BOBAI SUN SCREEN ... 50MG".
STRONG_COSMETIC = re.compile(
    r"\b(sunscreen|sun screen|spf|serum|cream|lotion|cleanser|shampoo|conditioner|hair mask|mask|"
    r"moisturi[sz]er|toner|deodorant|roll-?on|body wash|shower|soap|perfume|foundation|mascara|"
    r"eyeliner|concealer|lipstick|nail polish|hair color|hair colour|hair dye|bigen|scrub|mist|gel)\b",
    re.I,
)
STRONG_MED = re.compile(
    r"\b(tabs?|tablets?|caps?|capsules?|softgels?|gummies|syrup|drops|formula|supplement|dietary|"
    r"infant|nutrition|tab|powder)\b|\d+\s*(mg|mcg|iu)\b",
    re.I,
)


def classify(r):
    brand = (r.get("brand") or "").strip().lower()
    title = r.get("title") or ""
    if brand in RESCUE_BRANDS:
        return "keep", ""
    if brand in BLOCK_BRANDS:
        return "exclude", f"brand:{r['brand']}"
    m = BLOCK_TITLE.search(title)
    if m:
        # Title-only hit: rescue when it is clearly a cosmetic and has no medicine/supplement form words.
        if STRONG_COSMETIC.search(title) and not STRONG_MED.search(title) and not re.search(r"\bpads?\b|diaper|sanitiz|lice|minoxidil|k-y|lubricant|toothpaste|tooth|dental|mounjaro|tirzepatide|semaglutide", title, re.I):
            return "keep", ""
        return "exclude", f"title:{m.group(0).strip().lower()}"
    return "keep", ""


kept, excluded = [], []
for r in original:
    v, why = classify(r)
    if v == "keep":
        kept.append({k: r[k] for k in FIELDS})
    else:
        excluded.append(({k: r[k] for k in FIELDS}, why))

with open(FEED, "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=FIELDS, lineterminator="\r\n")
    w.writeheader()
    w.writerows(kept)

with open(EXCL, "w", newline="", encoding="utf-8") as f:
    w = csv.DictWriter(f, fieldnames=FIELDS + ["exclusion_reason"], lineterminator="\r\n")
    w.writeheader()
    for r, why in excluded:
        w.writerow({**r, "exclusion_reason": why})

reasons = collections.Counter(why.split(":")[0] for _, why in excluded)
print("original:", len(original), "| kept:", len(kept), "| excluded:", len(excluded), dict(reasons))
