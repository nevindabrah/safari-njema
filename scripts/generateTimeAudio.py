"""Records every time the Telling time clock can show, with the same Swahili voice and the same machine check as the lesson audio.

Exists so each time on the clock has a speaker button. A Swahili speech recogniser listens to a few takes of each phrase and
the clearest is kept. A phrase it could not follow gets no clip, so the app shows no speaker for it instead of a wrong sound.
The voice is Meta's MMS model, CC BY-NC 4.0: non-commercial use with credit. See generateAudio.py for the longer story.

Run from the repo root, in the same Python environment as generateAudio.py:
    python scripts/generateTimeAudio.py               every time, about 25 minutes
    python scripts/generateTimeAudio.py --only-held   only the times the last run held back, with more takes of each
"""
import json
import re
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np
import scipy.io.wavfile
import torch
from transformers import AutoProcessor, Wav2Vec2ForCTC

from audioVoice import Voice

OUT_DIR, MANIFEST, REPORT = Path("public/audio/time"), Path("src/features/time/timeAudio.json"), Path("docs/time-audio-report.json")
SHIP_AT = 0.85
TAKES = [(7, 0.88), (21, 0.88), (42, 0.82), (3, 0.78)]
MORE_TAKES = [(seed, speed) for speed in (0.72, 0.66, 0.8) for seed in (1, 2, 5, 9, 13)]
ONLY_HELD = "--only-held" in sys.argv

phrases = json.loads(subprocess.run(["node", "scripts/listTimePhrases.ts"], check=True, capture_output=True, text=True).stdout)
voice = Voice("facebook/mms-tts-swh")
processor = AutoProcessor.from_pretrained("facebook/mms-1b-all", target_lang="swh")
listener = Wav2Vec2ForCTC.from_pretrained("facebook/mms-1b-all", target_lang="swh", ignore_mismatched_sizes=True)

def letters(text: str) -> str:
    return re.sub(r"[^a-z]", "", text.lower())

def similarity(a: str, b: str) -> float:
    """One minus the edit distance over the longer length. 1.0 means heard exactly as written."""
    row = list(range(len(b) + 1))
    for i in range(1, len(a) + 1):
        previous, row[0] = row[0], i
        for j in range(1, len(b) + 1):
            current = row[j]
            row[j] = min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] != b[j - 1]))
            previous = current
    return 1 - row[-1] / max(len(a), len(b), 1)

def hear(audio: np.ndarray) -> str:
    with torch.no_grad():
        ids = torch.argmax(listener(**processor(audio, sampling_rate=16000, return_tensors="pt")).logits, dim=-1)[0]
    return processor.decode(ids)

OUT_DIR.mkdir(parents=True, exist_ok=True)
previous = {r["swahili"]: r for r in json.loads(REPORT.read_text())} if REPORT.exists() else {}
manifest = json.loads(MANIFEST.read_text()) if MANIFEST.exists() else {}
report = []
for index, swahili in enumerate(phrases):
    done = previous.get(swahili)
    if done and done["shipped"] and (OUT_DIR / done["file"]).exists():
        report.append(done)
        continue
    if ONLY_HELD and done:
        report.append(done)
        continue
    best = None
    for seed, speed in TAKES + (MORE_TAKES if ONLY_HELD else []):
        audio = voice.speak_phrase(swahili, seed, speed, True, 0.667)
        heard = hear(audio)
        score = similarity(letters(swahili), letters(heard))
        if best is None or score > best["score"]:
            best = {"audio": audio, "heard": heard, "score": score, "seed": seed, "speed": speed}
        if score == 1.0:
            break
    name = f"{index + 1:04d}.m4a"
    shipped = best["score"] >= SHIP_AT
    if shipped:
        with tempfile.NamedTemporaryFile(suffix=".wav") as wav:
            scipy.io.wavfile.write(wav.name, voice.rate, (best["audio"] * 32767).astype(np.int16))
            subprocess.run(["afconvert", "-f", "m4af", "-d", "aac", "-b", "32000", wav.name, str(OUT_DIR / name)], check=True)
        manifest[swahili] = f"/audio/time/{name}"
    report.append({"file": name, "swahili": swahili, "heard": best["heard"], "score": round(best["score"], 2), "shipped": shipped, "seed": best["seed"], "speed": best["speed"]})
    print(f"{name}  {best['score']:.2f}  {'    ' if shipped else 'HELD'}  {swahili}  ->  {best['heard']}", flush=True)

MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
scores = [r["score"] for r in report]
print(f"\n{len(manifest)} of {len(report)} times have a clip. Mean score {sum(scores) / len(scores):.3f}. Held back: {[r['swahili'] for r in report if not r['shipped']]}")
