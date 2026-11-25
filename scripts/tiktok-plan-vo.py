# Voiceover for the TikTok plan explainer (Scott, 25 Nov: "add ai voice"): Kokoro (open model, from its GitHub
# release, run locally), a British voice, one line per scene; prints each line's length for TikTokPlan.tsx.
import json, sys, soundfile as sf
from kokoro_onnx import Kokoro
M = sys.argv[1] if len(sys.argv) > 1 else "/dev/shm/tts"
k = Kokoro(f"{M}/kokoro-v1.0.onnx", f"{M}/voices-v1.0.bin")
LINES = [
 "Classic British Hotels on TikTok. Here's the plan for twenty twenty seven.",
 "We're on four hundred and seventy two followers, so five hundred is in sight. And views are growing fast, up ninety two percent in the last twenty eight days.",
 "But views aren't turning into follows. Only about one viewer in every hundred and eighty five visits our profile.",
 "So the job for next year is simple. Turn viewers into followers.",
 "Every video opens with a hook on screen from the very first frame. Our early posts with one averaged three hundred and twenty five views. Without one, under two hundred.",
 "And every video ends on a question, or a reason to follow.",
 "We'll post three to four times a week. Weekdays at eight in the evening, and weekends around lunchtime.",
 "The mix. Forty percent save for later lists and tips. Thirty percent stays and food, seen through the guest's eyes. Twenty percent stories, heritage and quirks. And ten percent animation made just for TikTok.",
 "Packages with a strong hook get their own video, like Rutland Hall's Four Roots Journey, which drew great engagement across every platform.",
 "We'll test one or two hosted stays with UK hotel creators, and like and comment on our members' posts every week.",
 "We'll judge it on watch time, engagement, profile visits and new followers, not on views alone.",
 "Paid stays small, and only behind what's already working. First up, a fourteen pound forty follower boost on our strongest reel, to take us past five hundred.",
 "From January to June: set up, test, boost, bring in creators, then scale what works.",
 "Three decisions to make. Our follower target for twenty twenty seven. Which members host a creator stay. And a budget, when there is one.",
]
out = []
for i, line in enumerate(LINES):
    a, sr = k.create(line, voice="bf_emma", speed=1.02, lang="en-gb")
    sf.write(f"public/explainer/vo/{i:02d}.wav", a, sr)
    out.append(round(len(a) / sr, 2))
print(json.dumps(out))
