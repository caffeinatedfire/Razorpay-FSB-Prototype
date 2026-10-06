# Builds docs/evidence/coded.csv. Quotes are cut verbatim from the saved review text by a start phrase
# and a word count; the script fails if the phrase is not found, so no quote can be typed by hand.
import csv, json, re, sys, os

REPO = r'D:\ISB\Razorpay\razorpay-collect-prototype'
ACCESSED = '2026-10-06'
PLAY = 'https://play.google.com/store/apps/details?id='
APPS = {
    'khatabook': ('com.vaibhavkalpe.android.khatabook', 'Khatabook'),
    'okcredit': ('in.okcredit.merchant', 'OkCredit'),
    'vyapar': ('in.android.vyapar', 'Vyapar'),
    'razorpay': ('com.razorpay.payments.app', 'Razorpay'),
    'paytm_business': ('com.paytm.business', 'Paytm for Business'),
    'phonepe_business': ('com.phonepe.app.business', 'PhonePe Business'),
    'bharatpe': ('com.bharatpe.app', 'BharatPe'),
    'cashfree': ('com.cashfree.merchant', 'Cashfree'),
}
APPLE_URL = 'https://apps.apple.com/in/app/razorpay-accept-payments-now/id1497250144'

reviews = {}
for app in APPS:
    for r in json.load(open(f'play/{app}.json', encoding='utf8')):
        reviews[(app, r['id'][:8])] = r

def apple_text():
    import html as h
    s = open('apple_rzp.html', encoding='utf8').read()
    t = re.sub(r'<script.*?</script>', '', s, flags=re.S)
    t = re.sub(r'<[^>]+>', '\n', t)
    return h.unescape(t)
APPLE = apple_text()

def redact(q):
    q = re.sub(r'(?<!\d)[6-9]\d{9}(?!\d)', '[redacted]', q)
    return q

def cut(text, start, nwords):
    flat = re.sub(r'\s+', ' ', text)
    i = flat.find(start)
    if i < 0:
        sys.exit(f'START NOT FOUND: {start!r}\nIN: {flat[:300]}')
    words = flat[i:].split(' ')[:min(nwords, 20)]
    return ' '.join(words)

# job, source app, review id prefix (or 'apple:<title>'), quote start, words, segment, pain,
# device_or_channel, workaround, stake_inr, mobile_signal, notes
FIRST_HAND = [
 # ---- collect
 ('collect','khatabook','27d34d9d','it would be better if the reminder goes on WhatsApp',19,'shop',2,'whatsapp|phone','other','',1,'SMS reminders ignored; asks for WhatsApp'),
 ('collect','khatabook','c151c9e1','Automatic SMS reminders always fail',17,'unknown',2,'phone','other','',1,'auto SMS reminders fail; manual SMS works; manual'),
 ('collect','khatabook','aef7feef','the lines given at the bottom of the WhatsApp reminder should be changed',13,'unknown',2,'whatsapp|phone','other','',1,'wants reminder wording changed; relationship'),
 ('collect','khatabook','473b8cc5','I am able to set only one collection date',20,'unknown',2,'unknown','other','',1,'one due date per customer, not per bill'),
 ('collect','khatabook','2ceab7a8','Is it possible that we can send a manual reminder',20,'unknown',1,'unknown','other','',1,'wants manual bulk reminder on due day; manual'),
 ('collect','khatabook','44aa227b','When setting collection date',20,'unknown',2,'phone','other','',1,'wants auto SMS on collection day; willing to pay'),
 ('collect','khatabook','cd929ef6',"we don't always want to remind our customers",18,'unknown',2,'unknown','other','',1,'fears app reminders break the relationship; relationship'),
 ('collect','khatabook','9fc2598d','when the date that customer promised to pay back',20,'unknown',1,'unknown','other','',1,'wants promised date tracked with reminder; promise'),
 ('collect','khatabook','3eeffc79','Msg. Sent should be customised',20,'unknown',1,'unknown','other','',1,'wants own message format; one-go reminders'),
 ('collect','khatabook','ffb24c88','please start bulk watsapp reminder features',20,'unknown',1,'whatsapp','other','',1,'sends WhatsApp requests one customer at a time; manual'),
 ('collect','khatabook','b691351f','please do something for templated messages',9,'unknown',1,'unknown','other','',1,'wants reminder templates'),
 ('collect','khatabook','be38a732','set reminder for the days count',20,'unknown',1,'unknown','other','',1,'wants reminders at 30 or 60 days after delivery'),
 ('collect','khatabook','1e36d32d','it is good to have the facility of Free SMS',14,'unknown',1,'phone','other','',1,'wants free SMS to remind customers of dues'),
 ('collect','khatabook','9f57ed0a','Great app for tracking udhaar and payments',17,'unknown',1,'unknown','other','',1,'praise; customers respond to reminders'),
 ('collect','khatabook','f392d5a3','payment reminders via WhatsApp/SMS',11,'shop',1,'whatsapp|phone','other','',1,'praise; reminders help collect dues on time'),
 ('collect','khatabook','711ec438','Kindly add features like fee collection',11,'tutor',1,'unknown','other','',1,'asks for fee collection and dues reminders for schools and coaching'),
 ('collect','khatabook','54e6c5cb','I set a payment reminder for a customer',20,'unknown',1,'unknown','other','',1,'no time slot for a reminder'),
 ('collect','okcredit','7ce6fa88','automatically sends message to your customers/cleint',20,'unknown',2,'phone','other','',1,'does not want automatic messages to clients; relationship'),
 ('collect','okcredit','81918130','it will send a sms to every person',17,'unknown',2,'phone','other','',1,'automatic SMS could ruin relationships; relationship'),
 ('collect','okcredit','3aa47da7','a single businessmen gives different credit period',20,'unknown',1,'unknown','other','',1,'different credit periods per customer; show due date'),
 ('collect','okcredit','860400b4','i need to send same amount request to multiple customers',20,'unknown',2,'unknown','other','',1,'sending requests one by one is difficult; manual'),
 ('collect','okcredit','b27169d9','if i want to send reminder someone in hindi language',15,'unknown',1,'unknown','other','',1,'wants Hindi reminders; language'),
 ('collect','okcredit','5f8e4092','Auto reminder option not working',20,'unknown',2,'whatsapp','other','',1,'paid plan; auto reminder broken; support slow'),
 ('collect','okcredit','111d6e8e','transaction reminders are now limited',6,'unknown',1,'unknown','other','',1,'reminders limited by subscription'),
 ('collect','okcredit','a01b43cf','Pehle main sab kuch register me likhta tha',20,'unknown',2,'phone|whatsapp','notebook','',2,'Hinglish; register before the app took time and missed entries; now tracked on mobile'),
 ('collect','okcredit','8525810e','the person who gets the reminder can able pay directly',20,'unknown',1,'unknown','other','',1,'wants payment option inside the reminder'),
 ('collect','okcredit','a11b60cd','after the latest update sms remind option is removed',20,'unknown',1,'phone|whatsapp','other','',1,'objects to WhatsApp-only reminders; counter-evidence on channel'),
 ('collect','okcredit','0dedb260','add Various Customer Message format',18,'unknown',1,'unknown','other','',1,'wants gentle reminder wording; relationship'),
 ('collect','okcredit','3204c55d','when we send a reminder to customer',20,'unknown',1,'phone','other','',1,'sender name HP-NOTICE reads badly; relationship'),
 ('collect','okcredit','157c5fdb','If I need to send a reminder in WhatsApp',20,'unknown',1,'whatsapp','other','',1,'wants WhatsApp choice and a pending-due filter'),
 ('collect','vyapar','03f92e5a','I I freelance doing hair and nails',20,'service',1,'unknown','other','',1,'praise; tracks who owes money'),
 ('collect','vyapar','3d01118f','If auto payment reminder masage to party',13,'unknown',1,'unknown','other','',1,'wants automatic payment reminder messages'),
 ('collect','vyapar','d97e9ad4','Plz add whatsapp integration',13,'unknown',1,'whatsapp','other','',1,'wants WhatsApp payment reminders'),
 ('collect','vyapar','a50c4666','That is option to set reminder to call customer',17,'unknown',1,'call','other','',1,'wants reminder to call customers; manual'),
 ('collect','razorpay','da3162f4','Our payment link SMSs are blocked by the DLT SP',20,'unknown',2,'phone','other','',1,'payment link SMS blocked; ticket open 10 days'),
 ('collect','bharatpe','df80b76b',"This app doesn't allow payment collect link above Rs 2000",19,'unknown',2,'unknown','other','',1,'collect-link amount limit'),
 ('collect','paytm_business','3fee9d30','how to create a payment link in the Paytm for business app',20,'unknown',1,'phone','other','',1,'cannot create payment link in the phone app'),
 # ---- dispute
 ('dispute','bharatpe','ff585f20','once you received machine and transact big amount they dispute the transaction',20,'unknown',3,'unknown','unknown','',0,'account blocked after dispute'),
 ('dispute','bharatpe','bdd04ea0','They takes more than a month just to resolve a dispute transaction',20,'unknown',3,'unknown','unknown','',0,'documents submitted; month in progress'),
 ('dispute','bharatpe','8870d26c','2 transaction are approved and 3rd one got disputed',20,'unknown',3,'unknown','unknown','',0,'21 declaration forms; amount held 1.5 months'),
 ('dispute','bharatpe','465f1fe6','the app raises a dispute unnecessary and holds the amount for 4 days',20,'unknown',2,'phone','unknown','',1,'must upload bill in app'),
 ('dispute','bharatpe','a967b543','first time in my life facing a dispute amount concern',20,'unknown',3,'whatsapp','unknown','',1,'held more than 30 days'),
 ('dispute','bharatpe','308481f0','it is showing all money is in disputed transactions',20,'unknown',3,'phone','unknown','7000',1,'money stuck in disputed transactions'),
 ('dispute','bharatpe','6a14486b','they hold the swiping amount and will say that it\'s a dispute transanction',20,'unknown',3,'unknown','unknown','',0,'asked for customer invoice'),
 ('dispute','bharatpe','748e719e','My total amount 79998 on hold by Bharat pay and showing dispute transactions',20,'unknown',3,'unknown','unknown','79998',0,'invoice rejected twice; 20 days'),
 ('dispute','bharatpe','21e460e9','it taking the every amount to dispute transition',20,'unknown',3,'unknown','unknown','',0,'invoice upload error'),
 ('dispute','cashfree','df2c9b09','I was charged ₹2,360 for the dispute',20,'unknown',3,'unknown','unknown','2360',0,'dispute fee; month to resolve'),
 ('dispute','paytm_business','d5c19168','I raised a ticket 1759 for transaction dispute',20,'shop',3,'unknown','unknown','115',0,'grocery shop; proofs uploaded; amount deducted'),
 ('dispute','paytm_business','6a54a3ff','An amount of Rs.2000 got deducted because a by mistake it gone into dispute',20,'unknown',3,'call','unknown','2000',0,'six tickets'),
 ('dispute','paytm_business','1da16d3e','they taking money in business A/c chargeback name',20,'unknown',3,'call','unknown','2000',0,'customer care called 10 times'),
 ('dispute','paytm_business','cf526cc3','Whenever a customer raises a complaint or dispute',20,'unknown',3,'unknown','unknown','',0,'amount blocked two or three months'),
 ('dispute','paytm_business','fc49538e','charge back issue not solved',5,'unknown',2,'unknown','unknown','',0,'short review'),
 ('dispute','phonepe_business','75372052','One person disputed against my account',20,'unknown',3,'call','unknown','28000',0,'settlement stuck after dispute'),
 ('dispute','razorpay','50acf5d9','One dispute or chargeback can freeze all funds',8,'unknown',3,'unknown','unknown','',0,'warning to other entrepreneurs'),
 ('dispute','razorpay','b591a142','Koi bhi Chargeback lagake Pese vapis le leta hai',20,'unknown',3,'call','unknown','',0,'Hinglish; chargeback clawback; recovery calls'),
 # ---- payout
 ('payout','razorpay','e62813e2','Payments get stuck, and support disappears',20,'unknown',3,'unknown','unknown','',0,'held payments'),
 ('payout','razorpay','eeb243e8','Settlement delays and weak customer support',13,'unknown',2,'unknown','unknown','',0,'slow support'),
 ('payout','razorpay','8f4c1054','my settlement is hold for 120 days',8,'unknown',3,'unknown','unknown','',0,'held 120 days'),
 ('payout','razorpay','10132d49','they hold the payment for no any reason and you just chase them',14,'unknown',3,'unknown','unknown','',0,'held payment; ticket only'),
 ('payout','razorpay','b02a6361','they blocked my settlement without any reason',20,'unknown',3,'unknown','unknown','20000',0,'settlement blocked'),
 ('payout','razorpay','121b651e','they will hold your money without any proper reason',20,'unknown',3,'unknown','unknown','',0,'small business owner or reseller'),
 ('payout','razorpay','62e94723','almost 3 month gone my money is still in hold',11,'unknown',3,'unknown','unknown','',0,'held 3 months'),
 ('payout','razorpay','43f71d4c','HELD MY MONEY FOR NO REASON',20,'unknown',3,'unknown','unknown','',0,'account suspended'),
 ('payout','razorpay','d21e4e88','Blocked/Not Settled since 31May',20,'unknown',3,'call','unknown','212000',0,'merchant id redacted; no WhatsApp chat'),
 ('payout','phonepe_business','e3d5d5ff','they holding my settlement',15,'unknown',3,'unknown','unknown','',0,'bot replies only'),
 ('payout','phonepe_business','693d8a8c','Once the funds are placed on hold',20,'unknown',3,'unknown','unknown','',0,'held 1 to 2 months'),
 ('payout','phonepe_business','509195b0','they hold your payments every few days',20,'unknown',3,'call','unknown','',0,'no callable support'),
 ('payout','phonepe_business','3c70930f','you have still held back my settlement of Rs 6340',20,'unknown',3,'unknown','unknown','6340',1,'used the app 1.5 years'),
 ('payout','phonepe_business','edfe1779','Settlement delays and unexpected charges create problems for merchants',10,'unknown',2,'unknown','unknown','',0,'5-star rating but negative text'),
 ('payout','paytm_business','dd25f23f','they will hold your fund any time without any notification',20,'unknown',3,'unknown','unknown','',0,'POS and soundbox'),
 ('payout','paytm_business','3177adc3','they stuck amount that you want to settle',20,'unknown',3,'unknown','unknown','',0,'no night support'),
 ('payout','apple','Holding settlement without any reason','When I received second payment they blocked the amount',20,'unknown',3,'unknown','unknown','',0,'App Store review; says 120 days for process'),
 ('payout','apple','Nothing but a blackmailing app','after accepting payments they will suddenly one day hold all your payments',20,'unknown',3,'unknown','unknown','',0,'App Store review; asked for invoices and client confirmation'),
]

CONTEXT = [
 ('collect','official_docs','https://razorpay.com/docs/payments/payment-links/reminders/','unknown',1,'unknown','Razorpay','none','',0,'You can set a maximum of 3 reminders.','Reminders are SMS and email only, sent 11AM-12PM and 3PM-5PM; account or per-link toggle on the Dashboard'),
 ('collect','official_docs','https://razorpay.com/docs/payments/payment-links/resend/','unknown',1,'desktop','Razorpay','none','',0,'You can resend Payment Links in the Issued state to your customer.','Manual resend from the Dashboard by email or SMS; mobile app not mentioned'),
 ('collect','official_docs','https://razorpay.com/docs/payments/payment-links/whatsapp-bot/','unknown',1,'whatsapp','Razorpay','none','',1,'accept payments from your customers by creating and sharing Payment Links to them directly from WhatsApp.','WhatsApp bot creates links; reminders are not mentioned'),
 ('collect','official_docs','https://razorpay.com/docs/payments/payment-links/states/','unknown',1,'unknown','Razorpay','none','',0,'Send a reminder to the customer to pay the next instalment.','Next step listed for Partially Paid links'),
 ('collect','official_docs','https://razorpay.com/payments-app/','unknown',1,'phone','Razorpay','none','',1,'Create and share payment links instantly','Product page for the mobile app; no reminder feature listed'),
 ('collect','official_docs','https://play.google.com/store/apps/details?id=com.razorpay.payments.app','unknown',1,'phone|whatsapp','Razorpay','none','',1,'Share payment links and recieve payments via an email, SMS, WhatsApp, Messenger etc.','Store listing description, updated 30 Sept 2026'),
 ('collect','official_docs','https://apps.apple.com/in/app/razorpay-accept-payments-now/id1497250144','unknown',1,'phone','Razorpay','none','',1,'payments, settlements, QR codes, and payment links all a tap away.','Release notes for the redesigned app, versions 3.0.3 to 3.0.7'),
 ('collect','official_docs','https://samadhaan.msme.gov.in/','unknown',1,'unknown','','none','',0,'within 45 days of the acceptance of the goods/service rendered. (Section 16)','Government page on MSMED Act delayed-payment interest; applies to buyers of micro and small enterprises'),
 ('collect','article','https://www.riffit.in/blog/payment-reminder-whatsapp-scripts-india','professional',1,'whatsapp','','none','',1,'In India WhatsApp is the normal channel for client follow-ups, and it is usually more effective than email','Company blog for freelancers, 17 Aug 2026; vendor content, not a merchant voice'),
 ('dispute','official_docs','https://razorpay.com/docs/payments/disputes/','unknown',1,'desktop','Razorpay','none','',0,'You can perform the following actions using the Dashboard: View disputes Accept disputes Contest disputes and submit evidence','Mobile app not mentioned'),
 ('payout','official_docs','https://razorpay.com/docs/payments/settlements/','unknown',1,'desktop','Razorpay','none','',0,'The standard settlement cycle for domestic payments is T+2 working days','Dashboard actions listed; mobile app not mentioned'),
]

# Pointers taken from the human's notes (docs/evidence/inbox/razorpay-track2-chat-notes.md), each re-read
# on 2026-10-06 before coding. origin is human_inbox. (job, type, url, posted, quote, notes)
INBOX = [
 ('collect','official_docs','https://razorpay.com/agent-studio/','unknown','Loan Recovery Agent Reaches borrowers after missed repayments and helps recover the loan at the right moment.','29 agent names on the page, grouped by industry (lending, insurance, investments, e-commerce); none chases a merchant\'s unpaid Payment Links or invoices; Dispute Responder and Chargeback Defence agents exist; result claims are Razorpay\'s own'),
 ('collect','official_docs','https://razorpay.com/blog/automate-payment-reminders/','unknown','The reminders will be sent at a time in the day based on our analysis of the payment patterns','Razorpay blog; schedule options "the day after you send the link" or "1 day before expiry"; SMS/email; the merchant does not pick the hour'),
 ('collect','article','https://www.the-rise.in/news/single-news.php?title=delayed-payments-to-msme-decline,-but-hurdle-remains:-game-fisme-report&id=267','2025-11-27','Delayed payments owed to India\'s 6.4 million MSMEs have decreased by 30%, from Rs 10.7 lakh crore in 2022','Delayed Payments Report 3.0 (GAME, FISME, C2FO): Rs 7.34 lakh crore as of March 2024; B2B trade credit, not Payment Links; SME Street gives the MSME count as 6.4 crore, so the count is not used'),
 ('collect','article','https://smestreet.in/infocus/delayed-payments-report-30-highlights-msme-finance-progress-10816194','2025-11-27','with average payment delays up to three times higher than those faced by larger firms.','Same report; micro units most affected; B2B trade credit'),
 ('collect','article','https://taxguru.in/income-tax/section-43bh-disallowances-expenses-due-non-payment-msmes.html','2024-03-28','Agreed Date OR Within 45 days from the date of acceptance, WHICHEVER IS EARLIER','Section 43B(h): buyer loses the deduction if a registered micro or small supplier is paid late; 15 days without a written agreement; CA-written article, not an official page'),
]

rows = []
n = 0
for (job, app, rid, start, nw, seg, pain, dev, work, stake, mob, notes) in FIRST_HAND:
    n += 1
    if app == 'apple':
        block = APPLE[APPLE.find(rid):]
        date_m = re.search(r'(\d\d)/(\d\d)/(\d{4})', block)
        posted = f'{date_m.group(3)}-{date_m.group(2)}-{date_m.group(1)}'
        q = cut(block, start, nw)
        url, tool, note = APPLE_URL, 'Razorpay', f'App Store review titled "{rid}"; rating not shown in page text; {notes}'
    else:
        r = reviews[(app, rid)]
        q = cut(r['body'], start, nw)
        posted = r['date']
        pkg, tool = APPS[app]
        url = PLAY + pkg
        note = f'Google Play review, {r["rating"]} stars, {r["date"]}, review id starts {rid}; {notes}'
    rows.append({'id': f'E-{n:03d}', 'origin': 'public_search', 'source_type': 'app_review', 'url': url,
                 'accessed_on': ACCESSED, 'posted_on': posted, 'job': job, 'segment': seg, 'pain': pain,
                 'device_or_channel': dev, 'tool_mentioned': tool, 'workaround': work, 'stake_inr': stake,
                 'mobile_signal': mob, 'quote': '"' + redact(q) + '"', 'notes': note})

for (job, st, url, seg, pain, dev, tool, work, stake, mob, quote, notes) in CONTEXT:
    n += 1
    words = quote.split(' ')
    assert len(words) <= 20, quote
    rows.append({'id': f'E-{n:03d}', 'origin': 'public_search', 'source_type': st, 'url': url,
                 'accessed_on': ACCESSED, 'posted_on': 'unknown' if 'riffit' not in url else '2026-08-17', 'job': job,
                 'segment': seg, 'pain': pain, 'device_or_channel': dev, 'tool_mentioned': tool, 'workaround': work,
                 'stake_inr': stake, 'mobile_signal': mob, 'quote': '"' + quote + '"', 'notes': 'context row; ' + notes})

for (job, st, url, posted, quote, notes) in INBOX:
    n += 1
    assert len(quote.split(' ')) <= 20, quote
    rows.append({'id': f'E-{n:03d}', 'origin': 'human_inbox', 'source_type': st, 'url': url,
                 'accessed_on': ACCESSED, 'posted_on': posted, 'job': job, 'segment': 'unknown', 'pain': 1,
                 'device_or_channel': 'unknown', 'tool_mentioned': 'Razorpay' if 'razorpay.com' in url else '',
                 'workaround': 'none', 'stake_inr': '', 'mobile_signal': 0, 'quote': '"' + quote + '"',
                 'notes': 'context row; pointer from the human\'s notes, re-read by the agent; ' + notes})

cols = ['id','origin','source_type','url','accessed_on','posted_on','job','segment','pain','device_or_channel',
        'tool_mentioned','workaround','stake_inr','mobile_signal','quote','notes']
os.makedirs(os.path.join(REPO, 'docs', 'evidence'), exist_ok=True)
with open(os.path.join(REPO, 'docs', 'evidence', 'coded.csv'), 'w', encoding='utf8', newline='') as f:
    w = csv.DictWriter(f, fieldnames=cols)
    w.writeheader()
    w.writerows(rows)
print('rows', len(rows))
for r in rows[:3]: print(r['id'], r['quote'])
