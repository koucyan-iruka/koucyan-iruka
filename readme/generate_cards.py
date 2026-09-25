"""Generate the Web Tools card images used in the profile README.

Run from the repository root:  python3 readme/generate_cards.py
"""
import base64
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "readme" / "cards"

# slug, icon, title, tag, description (2 lines), accent gradient (from, to)
TOOLS = [
    ("anthem", "readme/globe.svg", "Anthem Atlas", "EXPLORE",
     ["Click any country on the map", "and listen to its national anthem."],
     ("#0ea5e9", "#22d3ee")),
    ("capital", "icns/capital.svg", "World Capital Quiz", "GAME",
     ["How well do you know", "the world's capital cities?"],
     ("#10b981", "#84cc16")),
    ("nengou", "icns/nengo.svg", "Japanese Era Converter", "CONVERTER",
     ["Convert between Japanese eras", "and the Gregorian calendar."],
     ("#f43f5e", "#fb923c")),
    ("calc", "icns/cal.svg", "Calculator", "CALCULATOR",
     ["A clean, everyday calculator", "with basic operations and %."],
     ("#6366f1", "#a855f7")),
    ("talkingcalc", "icns/tkcal.svg", "Talking Calculator", "ACCESSIBILITY",
     ["An accessible calculator that", "reads results aloud."],
     ("#8b5cf6", "#ec4899")),
    ("clock", "icns/clc.svg", "Clock", "UTILITY",
     ["An easy-to-read analog", "+ digital clock."],
     ("#f59e0b", "#facc15")),
    ("sphere", "icns/pi.svg", "Sphere Calculator", "MATH",
     ["Surface area and volume", "of a sphere from its radius."],
     ("#14b8a6", "#0ea5e9")),
    ("baseconv", "icns/nbc.svg", "Base-n Converter", "CONVERTER",
     ["Binary, octal, hex,", "and any base-n number."],
     ("#3b82f6", "#6366f1")),
    ("counter", "icns/cnt.svg", "Counter", "UTILITY",
     ["A simple tally counter,", "one tap at a time."],
     ("#ef4444", "#f97316")),
    ("more", "icns/fav.svg", "See all on koutyan.com", "WEBSITE",
     ["Every tool in one place.", "Free, no install needed."],
     ("#64748b", "#94a3b8")),
]

W, H = 440, 150
FONT = "-apple-system, 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif"


def icon_data_uri(path):
    svg = (ROOT / path).read_text(encoding="utf-8")
    # Drop embedded C2PA metadata to keep the cards small.
    svg = re.sub(r"<metadata>.*?</metadata>", "", svg, flags=re.S)
    return "data:image/svg+xml;base64," + base64.b64encode(svg.encode()).decode()


def card(slug, icon, title, tag, desc, accent):
    a, b = accent
    tag_w = len(tag) * 7.2 + 18
    return f"""<svg xmlns="http://www.w3.org/2000/svg" width="{W}" height="{H}" viewBox="0 0 {W} {H}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#161b2e"/>
      <stop offset="1" stop-color="#0b0f1a"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="{a}"/>
      <stop offset="1" stop-color="{b}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.2" cy="0.3" r="0.6">
      <stop offset="0" stop-color="{a}" stop-opacity="0.28"/>
      <stop offset="1" stop-color="{a}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="shine" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#fff" stop-opacity="0"/>
      <stop offset="0.5" stop-color="#fff" stop-opacity="0.07"/>
      <stop offset="1" stop-color="#fff" stop-opacity="0"/>
    </linearGradient>
    <clipPath id="clip"><rect x="1" y="1" width="{W - 2}" height="{H - 2}" rx="18"/></clipPath>
  </defs>
  <style>
    .shine {{ animation: sweep 6s ease-in-out infinite; }}
    @keyframes sweep {{ 0%, 60% {{ transform: translateX(-200px); }} 100% {{ transform: translateX({W + 200}px); }} }}
    .title {{ font: 700 20px {FONT}; fill: #f8fafc; }}
    .desc {{ font: 400 13.5px {FONT}; fill: #94a3b8; }}
    .tag {{ font: 700 10.5px {FONT}; letter-spacing: 1px; fill: {a}; }}
    .open {{ font: 600 12px {FONT}; fill: #cbd5e1; }}
  </style>
  <g clip-path="url(#clip)">
    <rect width="{W}" height="{H}" fill="url(#bg)"/>
    <rect width="{W}" height="{H}" fill="url(#glow)"/>
    <rect width="5" height="{H}" fill="url(#accent)"/>
    <rect class="shine" x="0" y="0" width="160" height="{H}" fill="url(#shine)" transform="skewX(-20)"/>
  </g>
  <rect x="1" y="1" width="{W - 2}" height="{H - 2}" rx="18" fill="none" stroke="url(#accent)" stroke-opacity="0.55" stroke-width="1.5"/>

  <rect x="26" y="33" width="84" height="84" rx="20" fill="url(#accent)" opacity="0.9"/>
  <rect x="30" y="37" width="76" height="76" rx="17" fill="#ffffff"/>
  <image x="42" y="49" width="52" height="52" href="{icon_data_uri(icon)}"/>

  <rect x="132" y="28" width="{tag_w:.0f}" height="20" rx="10" fill="{a}" fill-opacity="0.14" stroke="{a}" stroke-opacity="0.45"/>
  <text class="tag" x="{132 + tag_w / 2:.0f}" y="42" text-anchor="middle">{tag}</text>
  <text class="title" x="132" y="76">{title}</text>
  <text class="desc" x="132" y="100">{desc[0]}</text>
  <text class="desc" x="132" y="119">{desc[1]}</text>
  <text class="open" x="{W - 22}" y="{H - 16}" text-anchor="end">Open ↗</text>
</svg>
"""


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    for slug, *rest in TOOLS:
        (OUT / f"{slug}.svg").write_text(card(slug, *rest), encoding="utf-8")
        print("wrote", OUT / f"{slug}.svg")
