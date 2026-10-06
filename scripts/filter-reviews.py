import json, re, glob, os, sys

PATTERNS = {
    'collect': r'remind|udh?a+r|tagada|payment (is )?pending|pending payment|recover|not pay|didn.t pay|don.t pay|\bowe|\bdues?\b|outstanding|credit (to|given)|baa?ki',
    'payout': r'settlement|settle|on hold|held|hold (my|the|our)|blocked (my|the|our)? ?(money|amount|fund|payment)',
    'dispute': r'chargeback|charge back|dispute',
}
job = sys.argv[1]
apps = sys.argv[2].split(',') if len(sys.argv) > 2 else None
kw = re.compile(PATTERNS[job], re.I)
for f in sorted(glob.glob('play/*.json')):
    app = os.path.basename(f)[:-5]
    if apps and app not in apps:
        continue
    for r in json.load(open(f, encoding='utf8')):
        b = r['body'] or ''
        if len(b) > 60 and kw.search(b):
            print(f"[{app}|{r['rating']}*|{r['date']}|{r['id'][:8]}] {b}\n")
