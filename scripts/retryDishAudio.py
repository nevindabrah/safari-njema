"""Tries much harder to record the dish names the first pass could not say clearly, and keeps a clip only when the recogniser is convinced.

Exists because four names kept failing the ordinary six takes, and a name with a doubtful clip is worse than a name with none.
Run from the repo root, in the same Python environment as generateDishAudio.py:
    python scripts/retryDishAudio.py Githeri Chai Maharagwe Sambusa
"""
import hashlib
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


def stamp(path: Path) -> str:
    return "?v=" + hashlib.md5(path.read_bytes()).hexdigest()[:8]

OUT_DIR, MANIFEST, REPORT = Path("public/audio/dishes"), Path("src/features/food/dishAudio.json"), Path("docs/dish-audio-report.json")
MAIN_VOICE = "facebook/mms-tts-swh"
OTHER_VOICES = ["Mwau/waxal_swahili-tts-mms", "mussacharles60/swahili-tts-female-voice", "stano03/jambogpt-swahili-tts-v1"]
KEEP_AT, OTHER_VOICE_NEEDS = 0.8, 0.95

wanted = sys.argv[1:]
names = re.findall(r"name: '([^']+)'", Path("src/features/food/dishes.ts").read_text())
processor = AutoProcessor.from_pretrained("facebook/mms-1b-all", target_lang="swh")
listener = Wav2Vec2ForCTC.from_pretrained("facebook/mms-1b-all", target_lang="swh", ignore_mismatched_sizes=True)
voices = {MAIN_VOICE: Voice(MAIN_VOICE)}

def letters(text):
    return re.sub(r"[^a-z]", "", text.lower())

def similarity(a, b):
    row = list(range(len(b) + 1))
    for i in range(1, len(a) + 1):
        previous, row[0] = row[0], i
        for j in range(1, len(b) + 1):
            current = row[j]
            row[j] = min(row[j] + 1, row[j - 1] + 1, previous + (a[i - 1] != b[j - 1]))
            previous = current
    return 1 - row[-1] / max(len(a), len(b), 1)

def hear(audio, rate):
    if rate != 16000:
        audio = np.interp(np.arange(0, len(audio), rate / 16000), np.arange(len(audio)), audio).astype(np.float32)
    with torch.no_grad():
        ids = torch.argmax(listener(**processor(audio, sampling_rate=16000, return_tensors="pt")).logits, dim=-1)[0]
    return processor.decode(ids)

manifest = json.loads(MANIFEST.read_text())
report = {row["name"]: row for row in json.loads(REPORT.read_text())}
takes = [(seed, speed, noise, method)
         for method in ("alone", "middle", "middle, quiet cut")
         for seed in (7, 21, 42, 1, 2, 3, 11)
         for speed in (0.88, 0.8, 0.75, 0.7)
         for noise in (0.667, 0.4, 0.3)]

for name in wanted:
    index = names.index(name)
    best = None
    for model_id in [MAIN_VOICE] + OTHER_VOICES:
        if model_id not in voices:
            voices[model_id] = Voice(model_id)
        voice = voices[model_id]
        bar = KEEP_AT if model_id == MAIN_VOICE else OTHER_VOICE_NEEDS
        for seed, speed, noise, method in (takes if model_id == MAIN_VOICE else takes[:24]):
            audio = voice.speak_phrase(name, seed, speed, True, noise, method)
            score = similarity(letters(name), letters(hear(audio, voice.rate)))
            if best is None or score > best["score"]:
                best = {"audio": audio, "rate": voice.rate, "score": score, "voice": model_id, "seed": seed, "speed": speed, "noise": noise, "method": method}
            if score >= 0.97:
                break
        if best["score"] >= bar and best["voice"] == model_id:
            break
    bar = KEEP_AT if best["voice"] == MAIN_VOICE else OTHER_VOICE_NEEDS
    keep = best["score"] >= bar
    print(f"{name:<12} best {best['score']:.2f} {'KEEP' if keep else 'still not good enough'}  [{best['voice'].split('/')[-1]}, {best['method']}, speed {best['speed']}, noise {best['noise']}]", flush=True)
    if not keep:
        continue
    file = f"{index + 1:02d}.m4a"
    with tempfile.NamedTemporaryFile(suffix=".wav") as wav:
        scipy.io.wavfile.write(wav.name, best["rate"], (best["audio"] * 32767).astype(np.int16))
        subprocess.run(["afconvert", "-f", "m4af", "-d", "aac", "-b", "40000", wav.name, str(OUT_DIR / file)], check=True)
    manifest[name] = f"/audio/dishes/{file}" + stamp(OUT_DIR / file)
    report[name] = {"file": file, "name": name, "score": round(best["score"], 2), "shipped": True, "take": {"voice": best["voice"], "seed": best["seed"], "speed": best["speed"], "noise": best["noise"], "method": best["method"]}}

MANIFEST.write_text(json.dumps({n: manifest[n] for n in names if n in manifest}, ensure_ascii=False, indent=2) + "\n")
REPORT.write_text(json.dumps([report[n] for n in names if n in report], ensure_ascii=False, indent=2) + "\n")
print(f"\n{len(manifest)} of {len(names)} dish names have a clip.")
