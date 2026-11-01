#!/usr/bin/env python3
"""Two Great National Christmas articles as Word documents (Bianca, 30 Oct: "a couple of topics and
rough content ... as a guide for the Xmas articles, more relevant to what we're trying to do"; they
replace the festive rush piece). Her two guides, "Managing Inventory and Pricing in Peak Seasons" and
"Operational Success for the Festive Season", keep their sections and order; each point is written
out for the Christmas and New Year peak, with her closing call to action word for word. Practical
advice only: no statistics, prices or legal claims that would need a source (Bianca wants the
content 100% correct). House rules: no em dashes, no hyphenated compounds, UK spelling. The GN
Word look of scripts/budget-docx.py (Cormorant headings, Open Sans body, GN navy, a lime rule).

Usage: python3 scripts/gn-xmas-articles.py   (writes out/articles-final/<title>.docx)
"""
import re
from pathlib import Path

from docx import Document
from docx.opc.constants import RELATIONSHIP_TYPE
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.shared import Cm, Pt, RGBColor

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "out/articles-final"
HEAD, BODY = "Cormorant Garamond", "Open Sans"
C = {"ink": "182b3c", "soft": "5b6b79", "accent": "aabb17", "org": "Great National Group"}
GN_CU = "https://www.corporate.greatnationalhotels.com/contact-us/"
SALES = "mailto:sales@greatnationalhotels.com"

# Each article: title, standfirst, sections of (heading, [paragraphs]); a paragraph opening with
# **lead.** reads as one of Bianca's points. [text](url) is a link, **text** bold.
ARTICLES = [
    {
        "file": "Great National peak season pricing article",
        "title": "Managing inventory and pricing over the festive peak",
        "standfirst": (
            "Christmas and New Year bring some of the busiest nights of the year for independent "
            "hotels, and some of the hardest to get right. Rooms that sell out too early at the "
            "wrong rate are as costly as rooms left empty. These are the strategies that help "
            "hotels fill the peak well, for the hotel and for the guest."
        ),
        "sections": [
            ("Forecast from what you already know", [
                "**Your own history.** Last year's bookings are the best guide to this year's. "
                "Look at when Christmas and New Year bookings came in, how far ahead, through which "
                "channels, and where you sold out early or were left with rooms on the night.",
                "**The local calendar.** Christmas markets, pantomimes, concerts, sporting fixtures "
                "and office party season in late November and December all move demand, often on "
                "specific nights. Put them in the forecast before they show up in bookings.",
                "**Your competitors.** Check the rates and availability of nearby hotels for the "
                "key dates regularly, through the season rather than once. When they fill, demand "
                "comes your way.",
            ]),
            ("Price with demand", [
                "**Revenue management tools.** A revenue management system can recommend or adjust "
                "rates from live demand and pickup. Without one, a weekly review of the peak dates "
                "against the same point last year does much of the same job.",
                "**Peak nights at peak rates.** New Year's Eve and the party Saturdays of December "
                "should be priced as the high demand nights they are, with better value on the "
                "quieter nights around them to spread the business.",
                "**Rates for each kind of guest.** Christmas party groups, couples on a break and "
                "families travelling home for the holidays book differently and value different "
                "things. Rates and packages built for each sell better than one rate for all.",
            ]),
            ("Manage your inventory", [
                "**Overbooking, with care.** Overbooking only works with reliable data on "
                "cancellations and no shows for those exact dates. Over Christmas and New Year, "
                "when many stays are packages booked months ahead, keep it to a minimum, and have "
                "a plan ready if a guest ever has to be moved to another hotel.",
                "**Length of stay.** A minimum stay on the busiest nights, such as two nights over "
                "New Year, stops a single night booking from blocking a longer, more valuable one.",
                "**Groups.** Weigh a group's total spend on rooms, dining and drinks against the "
                "individual bookings it would displace, and set release dates on group allocations "
                "so unsold rooms come back in time to sell.",
                "**Cancellations and deposits.** Clear, fair cancellation terms and deposits on "
                "festive packages reduce late cancellations and no shows. State them plainly at "
                "the point of booking.",
            ]),
            ("Upsell and cross sell", [
                "**Packages.** Bundling a room with dinner, a festive lunch or activities raises the "
                "value of each stay and makes the choice easier for the guest.",
                "**Extras.** Spa treatments, afternoon tea, a late checkout on New Year's Day or a "
                "room upgrade can all be offered in the emails guests receive before they arrive, "
                "when they are planning their stay.",
            ]),
            ("Keep guests informed and happy", [
                "**Clear, timely communication.** Tell guests exactly what their package includes, "
                "when dinners are served and what is needed from them, and let them know promptly "
                "of any change to their booking.",
                "**Personal service.** Remembering a returning guest's room, table or celebration "
                "builds the loyalty that brings them back next Christmas.",
                "**Feedback.** Ask for it, answer it, and note what to change. It becomes part of "
                "next year's forecast.",
            ]),
            ("How we can help", [
                "With the right forecasting, pricing and inventory controls in place, independent "
                "hotels can make the most of the festive peak and give their guests a stay to "
                "remember.",
                "Want to find out how we can help you with revenue and inventory management? "
                f"[Email sales@greatnationalhotels.com]({SALES}) today to schedule a free "
                "consultation.",
            ]),
        ],
    },
    {
        "file": "Great National festive operations article",
        "title": "Preparing your independent hotel for the festive season",
        "standfirst": (
            "The festive season brings celebration, full dining rooms and some of the busiest "
            "weeks of the year. It also brings its own operational challenges. A smooth season "
            "starts with preparation, and November is the time to do it."
        ),
        "sections": [
            ("Staffing and scheduling", [
                "**Plan to demand.** Base staffing on expected occupancy and covers for each day, "
                "including party nights, Christmas Day and New Year's Eve.",
                "**Cross train.** Staff who can work across roles keep service running when "
                "someone is off sick at the busiest moment.",
                "**A festive rota, early.** Extended hours, holiday shifts and overtime are easier "
                "to staff, and fairer to the team, when the rota is published in good time.",
            ]),
            ("Stock and suppliers", [
                "**Stock up.** Make sure food, drink, guest amenities and cleaning supplies match "
                "the forecast, with a margin for the busiest days.",
                "**Check regularly.** Frequent stock checks through December catch shortages "
                "before guests notice them.",
                "**Work with your suppliers.** Agree delivery dates for the holiday period early. "
                "Many suppliers close or run reduced services over Christmas and New Year, and "
                "strong relationships help when an order has to change at short notice.",
            ]),
            ("Rooms, cleaning and maintenance", [
                "**Deep clean first.** Schedule deep cleaning of rooms and public areas before the "
                "season begins, while there is still time between bookings.",
                "**Inspect often.** Regular inspections catch maintenance issues while they are "
                "small and quick to fix.",
                "**Festive touches.** Decorations and seasonal amenities make a warm welcome, "
                "placed so they never block exits or walkways.",
            ]),
            ("Energy", [
                "**Use less.** Heat and light the spaces in use, and turn them down in function "
                "rooms and closed areas between events.",
                "**Service the systems.** Have heating and hot water checked before the cold "
                "weather, when a breakdown would matter most.",
                "**Track consumption.** Monitoring use through the season shows where the savings "
                "are, for this year and the next.",
            ]),
            ("Security and safety", [
                "**Review procedures.** Make sure security protocols and emergency plans are up to "
                "date, and that the fire risk assessment reflects the decorations, larger events "
                "and busier public areas of the season.",
                "**Train the team.** Seasonal and new staff need the same security and emergency "
                "training as everyone else, before their first busy shift.",
                "**Add cover where needed.** Consider extra security measures for large parties "
                "and New Year's Eve.",
            ]),
            ("Guest services", [
                "**Make it personal.** Small, personal touches turn a busy festive stay into a "
                "memorable one.",
                "**Manage expectations.** Be clear about anything that works differently over the "
                "holidays, such as dining times, facilities or checkout.",
                "**Resolve complaints quickly.** A prompt, professional response often matters more "
                "to guests than the problem itself.",
            ]),
            ("Marketing and promotions", [
                "**Festive packages.** Well built packages give guests a reason to book, and to "
                "book early.",
                "**Social media.** Share the season as it happens at your hotel: the decorations, "
                "the menus, the team.",
                "**Local partners.** Joint offers with local businesses, attractions and events "
                "reach new guests and add value to a stay.",
            ]),
            ("How we can help", [
                "With these steps in place, independent hotels can go into the festive season "
                "ready for a busy, successful few weeks, and give their guests a stay to remember.",
                "Contact us today to discuss your hotel's unique challenges and explore how we can "
                f"help you achieve operational excellence. [Get in touch]({GN_CU}) or "
                f"[email sales@greatnationalhotels.com]({SALES}).",
            ]),
        ],
    },
]


def rgb(h):
    return RGBColor.from_string(h.upper())


def font(run, name, size, color, bold=None, italic=None):
    run.font.name = name
    rpr = run._element.get_or_add_rPr()
    rpr.get_or_add_rFonts().set(qn("w:eastAsia"), name)
    rpr.get_or_add_rFonts().set(qn("w:hAnsi"), name)
    run.font.size = Pt(size)
    run.font.color.rgb = rgb(color)
    if bold is not None:
        run.bold = bold
    if italic is not None:
        run.italic = italic
    return run


def hyperlink(p, url, size, text):
    rid = p.part.relate_to(url, RELATIONSHIP_TYPE.HYPERLINK, is_external=True)
    h = OxmlElement("w:hyperlink")
    h.set(qn("r:id"), rid)
    r = OxmlElement("w:r")
    rpr = OxmlElement("w:rPr")
    for tag, attrs in (("w:rFonts", {"w:ascii": BODY, "w:hAnsi": BODY}), ("w:color", {"w:val": C["ink"]}),
                       ("w:u", {"w:val": "single"}), ("w:sz", {"w:val": str(int(size * 2))})):
        e = OxmlElement(tag)
        for k, v in attrs.items():
            e.set(qn(k), v)
        rpr.append(e)
    r.append(rpr)
    t = OxmlElement("w:t")
    t.text = text
    t.set(qn("xml:space"), "preserve")
    r.append(t)
    h.append(r)
    p._p.append(h)


def para(doc, text, size=10.5, italic=False, after=8):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(after)
    p.paragraph_format.line_spacing = 1.35
    for i, part in enumerate(re.split(r"\*\*", text)):
        bits = re.split(r"\[([^\]]+)\]\(([^)]+)\)", part)
        for j, bit in enumerate(bits):
            if j % 3 == 1:
                hyperlink(p, bits[j + 1], size, bit)
            elif j % 3 == 0 and bit:
                font(p.add_run(bit), BODY, size, C["ink"], bold=i % 2 == 1, italic=italic)
    return p


def heading(doc, text):
    p = doc.add_paragraph()
    p.paragraph_format.space_before = Pt(18)
    p.paragraph_format.space_after = Pt(6)
    p.paragraph_format.keep_with_next = True
    font(p.add_run(text), HEAD, 20, C["ink"], bold=True)


def rule(doc):
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(10)
    p.paragraph_format.right_indent = Cm(13)
    bdr = OxmlElement("w:pBdr")
    b = OxmlElement("w:bottom")
    for k, v in (("w:val", "single"), ("w:sz", "18"), ("w:color", C["accent"])):
        b.set(qn(k), v)
    bdr.append(b)
    p._p.get_or_add_pPr().append(bdr)


def build(a):
    doc = Document()
    sec = doc.sections[0]
    sec.left_margin = sec.right_margin = Cm(2.4)
    sec.top_margin = sec.bottom_margin = Cm(2.2)
    doc.styles["Normal"].font.name = BODY
    doc.core_properties.title = a["title"]
    doc.core_properties.author = C["org"]
    p = doc.add_paragraph()
    p.paragraph_format.space_after = Pt(4)
    font(p.add_run(a["title"]), HEAD, 30, C["ink"], bold=True)
    rule(doc)
    para(doc, a["standfirst"], size=12.5, italic=True, after=14)
    for head, paras in a["sections"]:
        heading(doc, head)
        for text in paras:
            para(doc, text)
    OUT.mkdir(parents=True, exist_ok=True)
    dest = OUT / f"{a['file']}.docx"
    doc.save(dest)
    words = sum(len(re.sub(r"\[([^\]]+)\]\([^)]+\)|\*\*", r"\1", t).split())
                for _, ps in a["sections"] for t in ps) + len(a["standfirst"].split())
    print(dest.relative_to(ROOT), words, "words")


if __name__ == "__main__":
    for a in ARTICLES:
        build(a)
