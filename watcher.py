# ════════════════════════════════════════════
# watcher.py — نظام متابعة عروب
# يعمل 24/7 على Railway.app
# يراقب قاعدة البيانات ويرسل تنبيهات Telegram
# ════════════════════════════════════════════

import time
import requests
from datetime import datetime, timezone
import json
import os

# ══ CONFIG ══
TG_TOKEN  = "8681291161:AAEGRhb74he8tUiISC_t6VupQLy6WJ79GS4"
TG_API    = f"https://api.telegram.org/bot{TG_TOKEN}/sendMessage"
JB_KEY    = "$2a$10$Ktfs47YjbKTB9PY9gs3zy.xJk6LTk1QX63bNpzPMAcCaMlSx4rxTq"
JB_BIN_ID = os.environ.get("JB_BIN_ID", "69b603c4b7ec241ddc6c2b77")

TARGETS = [
    "177072554",      # عروب الشخصي
    "1609089669",     # الشخص الثاني
    "-1003704804541", # مجموعة Aruob_bot
]

# مستويات الإنذار (بالدقائق)
ALERT_LEVELS = [
    {"min": 90,  "level": 1, "emoji": "🟢", "label": "تنبيه",
     "kidney": "راقبي الوضع — القسطرة تأخرت قليلاً"},
    {"min": 120, "level": 2, "emoji": "🟡", "label": "تحذير",
     "kidney": "احتمال احتباس البول — يجب التدخل قريباً"},
    {"min": 150, "level": 3, "emoji": "🟠", "label": "تحذير عاجل",
     "kidney": "⚠️ ضغط على الكلى يبدأ — تدخل الآن"},
    {"min": 180, "level": 4, "emoji": "🔴", "label": "إنذار — خطر على الكلى",
     "kidney": "🚨 خطر مباشر على الكلى\n• ارتجاع البول للكلى محتمل\n• التهاب مجرى البول (UTI)\n• تدخل فوري مطلوب"},
    {"min": 240, "level": 5, "emoji": "🚨", "label": "إنذار حرج — اتصل بالطبيب",
     "kidney": "🔴 فشل كلوي محتمل\n• الاحتباس أكثر من 4 ساعات خطر جداً\n• يسبب تلف الكلى\n• اتصل بالطبيب المسؤول فوراً"},
]

# تتبع آخر إنذار مرسل
sent_alerts = {}
CHECK_INTERVAL = 60  # ثانية

def send_telegram(text):
    success = False
    for chat_id in TARGETS:
        try:
            r = requests.post(TG_API, json={
                "chat_id": chat_id,
                "text": text,
                "parse_mode": "HTML"
            }, timeout=10)
            if r.json().get("ok"):
                success = True
        except Exception as e:
            print(f"TG Error [{chat_id}]: {e}")
    return success

def read_db():
    if not JB_BIN_ID:
        print("⚠️ JB_BIN_ID غير محدد")
        return None
    try:
        r = requests.get(
            f"https://api.jsonbin.io/v3/b/{JB_BIN_ID}/latest",
            headers={"X-Master-Key": JB_KEY},
            timeout=10
        )
        return r.json().get("record")
    except Exception as e:
        print(f"DB Error: {e}")
        return None

def check_catheter():
    db = read_db()
    if not db or not db.get("last_catheter"):
        return

    last_cath_str = db["last_catheter"]
    try:
        last_cath = datetime.fromisoformat(last_cath_str.replace("Z", "+00:00"))
    except:
        return

    now = datetime.now(timezone.utc)
    diff_minutes = (now - last_cath).total_seconds() / 60

    # اختر المستوى المناسب
    current_level = None
    for lvl in reversed(ALERT_LEVELS):
        if diff_minutes >= lvl["min"]:
            current_level = lvl
            break

    if not current_level:
        return

    key = f"L{current_level['level']}"
    now_ts = time.time()

    # أرسل مرة كل 30 دقيقة لكل مستوى
    if now_ts - sent_alerts.get(key, 0) < 30 * 60:
        return

    sent_alerts[key] = now_ts
    # أعد تعيين المستويات الأدنى
    for i in range(1, current_level["level"]):
        sent_alerts.pop(f"L{i}", None)

    hrs = int(diff_minutes // 60)
    mins = int(diff_minutes % 60)
    time_str = f"{hrs} ساعة و{mins} دقيقة" if hrs > 0 else f"{int(diff_minutes)} دقيقة"

    msg = f"""🏥 <b>نظام متابعة عروب</b>
━━━━━━━━━━━━━━━━
{current_level['emoji']} <b>المستوى {current_level['level']} — {current_level['label']}</b>
━━━━━━━━━━━━━━━━
💧 <b>تأخر القسطرة: {time_str}</b>

🫘 <b>تأثير على الكلى:</b>
{current_level['kidney']}
"""

    if current_level["level"] >= 4:
        msg += f"""
⚠️ <b>معلومات طبية:</b>
الاحتباس البولي لأكثر من 3 ساعات يسبب:
• ارتجاع البول للكلى (Vesicoureteral reflux)
• ضغط على الحالب والحوض الكلوي
• التهاب مجرى البول (UTI)
• تلف لا رجعة فيه إذا استمر
"""

    if current_level["level"] == 5:
        msg += "\n🚨 <b>اتصل بالطبيب المسؤول فوراً</b>"

    msg += f"\n\n⏰ الوقت: {now.strftime('%H:%M')} — {now.strftime('%Y/%m/%d')}"
    msg += "\n👤 نظام متابعة عروب — السيرفر الآلي"

    ok = send_telegram(msg)
    status = "✅ أُرسل" if ok else "❌ فشل"
    print(f"[{datetime.now().strftime('%H:%M:%S')}] L{current_level['level']} — {time_str} — {status}")

def main():
    print("🏥 نظام متابعة عروب — السيرفر الآلي")
    print(f"⏱️  يفحص كل {CHECK_INTERVAL} ثانية")
    print(f"📡 BIN ID: {JB_BIN_ID[:10]}..." if JB_BIN_ID else "⚠️  JB_BIN_ID غير محدد!")
    print("─" * 40)

    while True:
        try:
            check_catheter()
        except Exception as e:
            print(f"Error: {e}")
        time.sleep(CHECK_INTERVAL)

if __name__ == "__main__":
    main()
