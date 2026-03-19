# ════════════════════════════════════════════
# watcher.py — نظام متابعة عروب
# نسخة مبسطة ومضمونة — Flask + Watcher
# ════════════════════════════════════════════

import time, threading, os, requests
from datetime import datetime, timezone
from flask import Flask, jsonify, request

app   = Flask(__name__)
PORT  = int(os.environ.get("PORT", 8080))

TG_TOKEN  = "8681291161:AAEGRhb74he8tUiISC_t6VupQLy6WJ79GS4"
TG_API    = f"https://api.telegram.org/bot{TG_TOKEN}/sendMessage"
JB_KEY    = "$2a$10$Ktfs47YjbKTB9PY9gs3zy.xJk6LTk1QX63bNpzPMAcCaMlSx4rxTq"
JB_BIN_ID = os.environ.get("JB_BIN_ID", "69b603c4b7ec241ddc6c2b77")

TARGETS = ["177072554", "1609089669", "-1003704804541"]

ALERT_LEVELS = [
    {"min":90,  "level":1, "emoji":"🟢", "label":"تنبيه",
     "kidney":"راقبي الوضع — القسطرة تأخرت قليلاً"},
    {"min":120, "level":2, "emoji":"🟡", "label":"تحذير",
     "kidney":"احتمال احتباس البول — يجب التدخل قريباً"},
    {"min":150, "level":3, "emoji":"🟠", "label":"تحذير عاجل",
     "kidney":"⚠️ ضغط على الكلى يبدأ — تدخل الآن"},
    {"min":180, "level":4, "emoji":"🔴", "label":"إنذار — خطر على الكلى",
     "kidney":"🚨 خطر مباشر على الكلى\n• ارتجاع البول للكلى محتمل\n• التهاب مجرى البول (UTI)\n• تدخل فوري مطلوب"},
    {"min":240, "level":5, "emoji":"🚨", "label":"إنذار حرج — اتصل بالطبيب",
     "kidney":"🔴 فشل كلوي محتمل\n• الاحتباس أكثر من 4 ساعات خطر جداً\n• اتصل بالطبيب المسؤول فوراً"},
]

# ══ STATE الموحد ══
state = {
    "last_catheter": None,
    "diff_minutes":  None,
    "alert_level":   0,
    "alert_label":   "",
    "alert_emoji":   "",
    "kidney_msg":    "",
    "updated_at":    None,
    # إعدادات وضع النوم — تُحدَّث من الأجهزة
    "sleep_mode":    False,
    "sleep_from":    "23:00",
    "sleep_to":      "07:00",
}
sent_alerts = {}

# ══════════════════════════════════════════
# HELPER
# ══════════════════════════════════════════
def now_str():
    return datetime.now().strftime("%H:%M:%S")

def is_sleep_time():
    if not state["sleep_mode"]:
        return False
    try:
        now = datetime.now()
        cur = now.hour * 60 + now.minute
        fh, fm = map(int, state["sleep_from"].split(":"))
        th, tm = map(int, state["sleep_to"].split(":"))
        frm = fh * 60 + fm
        to  = th * 60 + tm
        if frm > to:
            return cur >= frm or cur < to
        return frm <= cur < to
    except:
        return False

def add_cors(resp):
    resp.headers["Access-Control-Allow-Origin"]  = "*"
    resp.headers["Access-Control-Allow-Headers"] = "Content-Type"
    resp.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return resp

# ══════════════════════════════════════════
# API ENDPOINTS
# ══════════════════════════════════════════

@app.after_request
def after(resp):
    return add_cors(resp)

@app.route("/health", methods=["GET"])
def health():
    return jsonify({"ok": True, "time": now_str()})

@app.route("/status", methods=["GET"])
def get_status():
    return jsonify({
        "ok":            True,
        "last_catheter": state["last_catheter"],
        "diff_minutes":  state["diff_minutes"],
        "alert_level":   state["alert_level"],
        "alert_label":   state["alert_label"],
        "alert_emoji":   state["alert_emoji"],
        "kidney_msg":    state["kidney_msg"],
        "updated_at":    state["updated_at"],
        "sleep_active":  is_sleep_time(),
        "server_time":   datetime.now(timezone.utc).isoformat(),
    })

@app.route("/log", methods=["POST", "OPTIONS"])
def log_entry():
    if request.method == "OPTIONS":
        return jsonify({"ok": True})
    data      = request.get_json() or {}
    etype     = data.get("type", "")
    timestamp = data.get("timestamp", "")

    if etype == "catheter" and timestamp:
        state["last_catheter"] = timestamp
        state["updated_at"]    = datetime.now(timezone.utc).isoformat()
        sent_alerts.clear()
        print(f"[{now_str()}] ✅ قسطرة جديدة: {timestamp}")

    # حفظ في JSONBin
    threading.Thread(target=save_entry, args=(data,), daemon=True).start()
    return jsonify({"ok": True})

@app.route("/settings", methods=["POST", "OPTIONS"])
def update_settings():
    """الأجهزة ترسل إعدادات وضع النوم للسيرفر"""
    if request.method == "OPTIONS":
        return jsonify({"ok": True})
    data = request.get_json() or {}
    if "sleep_mode"  in data: state["sleep_mode"]  = bool(data["sleep_mode"])
    if "sleep_from"  in data: state["sleep_from"]  = data["sleep_from"]
    if "sleep_to"    in data: state["sleep_to"]    = data["sleep_to"]
    print(f"[{now_str()}] ⚙️ وضع النوم: {state['sleep_mode']} ({state['sleep_from']}–{state['sleep_to']})")
    return jsonify({"ok": True, "sleep_mode": state["sleep_mode"]})

# ══════════════════════════════════════════
# JSONBIN
# ══════════════════════════════════════════
def save_entry(entry):
    try:
        r   = requests.get(
            f"https://api.jsonbin.io/v3/b/{JB_BIN_ID}/latest",
            headers={"X-Master-Key": JB_KEY}, timeout=10)
        rec = r.json().get("record") or {"logs": [], "version": 3}
        logs = rec.get("logs", [])
        logs.insert(0, entry)
        rec["logs"] = logs[:200]
        if entry.get("type") == "catheter":
            rec["last_catheter"] = entry.get("timestamp")
        rec["updated_at"] = datetime.now(timezone.utc).isoformat()
        requests.put(
            f"https://api.jsonbin.io/v3/b/{JB_BIN_ID}",
            headers={"Content-Type": "application/json", "X-Master-Key": JB_KEY},
            json=rec, timeout=10)
    except Exception as e:
        print(f"JB error: {e}")

def load_from_jsonbin():
    try:
        r   = requests.get(
            f"https://api.jsonbin.io/v3/b/{JB_BIN_ID}/latest",
            headers={"X-Master-Key": JB_KEY}, timeout=10)
        rec = r.json().get("record") or {}
        if rec.get("last_catheter"):
            state["last_catheter"] = rec["last_catheter"]
            print(f"[{now_str()}] 📡 آخر قسطرة محملة: {rec['last_catheter']}")
    except Exception as e:
        print(f"JB load error: {e}")

# ══════════════════════════════════════════
# TELEGRAM
# ══════════════════════════════════════════
def send_telegram(text):
    ok = False
    for chat_id in TARGETS:
        try:
            r = requests.post(TG_API,
                json={"chat_id": chat_id, "text": text, "parse_mode": "HTML"},
                timeout=10)
            if r.json().get("ok"):
                ok = True
        except Exception as e:
            print(f"TG [{chat_id}]: {e}")
    return ok

# ══════════════════════════════════════════
# WATCHER
# ══════════════════════════════════════════
def watch_tick():
    last_cath = state.get("last_catheter")
    if not last_cath:
        state.update({"diff_minutes": None, "alert_level": 0,
                      "alert_label": "", "alert_emoji": "", "kidney_msg": ""})
        return

    try:
        last_dt = datetime.fromisoformat(last_cath.replace("Z", "+00:00"))
    except:
        return

    now  = datetime.now(timezone.utc)
    diff = (now - last_dt).total_seconds() / 60

    lvl = None
    for l in reversed(ALERT_LEVELS):
        if diff >= l["min"]:
            lvl = l
            break

    state.update({
        "diff_minutes": round(diff, 1),
        "alert_level":  lvl["level"]  if lvl else 0,
        "alert_label":  lvl["label"]  if lvl else "",
        "alert_emoji":  lvl["emoji"]  if lvl else "",
        "kidney_msg":   lvl["kidney"] if lvl else "",
        "updated_at":   now.isoformat(),
    })

    if not lvl:
        return

    # لا ترسل أثناء وضع النوم
    if is_sleep_time():
        print(f"[{now_str()}] 🌙 وضع النوم — تخطي التنبيه")
        return

    key    = f"L{lvl['level']}"
    now_ts = time.time()
    if now_ts - sent_alerts.get(key, 0) < 30 * 60:
        return

    sent_alerts[key] = now_ts
    for i in range(1, lvl["level"]):
        sent_alerts.pop(f"L{i}", None)

    hrs  = int(diff // 60)
    mins = int(diff % 60)
    tstr = f"{hrs} ساعة و{mins} دقيقة" if hrs > 0 else f"{int(diff)} دقيقة"

    msg = f"""🏥 <b>نظام متابعة عروب</b>
━━━━━━━━━━━━━━━━
{lvl['emoji']} <b>المستوى {lvl['level']} — {lvl['label']}</b>
━━━━━━━━━━━━━━━━
💧 <b>تأخر القسطرة: {tstr}</b>

🫘 <b>تأثير على الكلى:</b>
{lvl['kidney']}"""

    if lvl["level"] >= 4:
        msg += """

⚠️ <b>معلومات طبية:</b>
• ارتجاع البول للكلى (Vesicoureteral reflux)
• التهاب مجرى البول (UTI)
• تلف لا رجعة فيه إذا استمر"""

    if lvl["level"] == 5:
        msg += "\n\n🚨 <b>اتصل بالطبيب المسؤول فوراً</b>"

    msg += f"\n\n⏰ {now.strftime('%H:%M')} — {now.strftime('%Y/%m/%d')}"
    msg += "\n👤 نظام متابعة عروب — السيرفر الآلي"

    ok = send_telegram(msg)
    print(f"[{now_str()}] {'✅' if ok else '❌'} L{lvl['level']} — {tstr}")

def run_watcher():
    while True:
        try:
            watch_tick()
        except Exception as e:
            print(f"Watcher error: {e}")
        time.sleep(60)

# ══════════════════════════════════════════
# MAIN
# ══════════════════════════════════════════
if __name__ == "__main__":
    print("🏥 نظام متابعة عروب — السيرفر الآلي")
    print(f"🌐 PORT: {PORT}")
    load_from_jsonbin()
    threading.Thread(target=run_watcher, daemon=True).start()
    print(f"[{now_str()}] ✅ Watcher + API جاهزان")
    app.run(host="0.0.0.0", port=PORT)
