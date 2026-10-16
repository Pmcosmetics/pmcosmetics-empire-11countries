import csv, re

base = "data/catalog/"
MED = re.compile(
    r"\b(stopadol|panadol|terramycin|mebo|neocarbon|neo mercazole|mercazole|amipride|amiprostone|"
    r"seleno|spascolon|zolm|solan|barcimiant|bio legam|congestal|telfast|nicorette|"
    r"sinus|cough|flu|antibiotic|ointment|oint|tab|tabs|tablets?|capsules?|cap|caps|film|"
    r"syrup|drops|mg|gm\b|ampoule|injection|paracetamol|ibuprofen|diclofenac|amoxicillin|"
    r"metformin|omeprazole|loratadine|cetirizine|antacid|laxative|vitamin|supplement|"
    r"powder|sachet|nac\b|zinc|physiomer|saline|nasal|ice bag|burn|wound|antifungal|"
    r"clotrimazole|ketoconazole|hydrocortisone|mupirocin|betamethasone|steroid|pain|relief)\b",
    re.I,
)

with open(base + "meta-commerce-feed-2026-10-15.csv", newline="", encoding="utf-8") as f:
    rows = list(csv.DictReader(f))

hits = [r for r in rows if MED.search(r["title"])]
print("kept rows matching medicine/supplement/device terms:", len(hits))
for r in hits:
    m = MED.search(r["title"]).group(0)
    print(f"  [{m}] {r['id']} | {r['title'][:75]} | {r['brand']}")
