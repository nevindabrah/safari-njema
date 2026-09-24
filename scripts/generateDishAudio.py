"""Records the name of every dish on the food page with the same Swahili voice and the same machine check as the lesson audio.

Exists so each dish has a speaker button. Names the recogniser cannot follow get no clip, and the card says the audio is coming.
Run from the repo root, in the same Python environment as generateAudio.py:
    python scripts/generateDishAudio.py
"""
import hashlib
import json
import re
import subprocess
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
SHIP_AT = 0.8
TAKES = [(7, 0.88, "alone"), (21, 0.88, "alone"), (42, 0.8, "alone"), (7, 0.85, "middle"), (21, 0.85, "middle"), (3, 0.75, "alone")]

names = re.findall(r"name: '([^']+)'", Path("src/features/food/dishes.ts").read_text())
voice = Voice("facebook/mms-tts-swh")
processor = AutoProcessor.from_pretrained("facebook/mms-1b-all", target_lang="swh")
listener = Wav2Vec2ForCTC.from_pretrained("facebook/mms-1b-all", target_lang="swh", ignore_mismatched_sizes=True)


def letters(text: str) -> str:
    return re.sub(r"[^a-z]", "", text.lower())


def similarity(a: str, b: str) -> float:
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
manifest, report = {}, []
for index, name in enumerate(names):
    single = " " not in name
    best = None
    for seed, speed, method in TAKES:
        if method == "middle" and not single:
            continue
        audio = voice.speak_phrase(name, seed, speed, True, 0.667, method)
        heard = hear(audio)
        score = similarity(letters(name), letters(heard))
        if best is None or score > best["score"]:
            best = {"audio": audio, "heard": heard, "score": score, "seed": seed, "speed": speed, "method": method}
        if score == 1.0:
            break
    file = f"{index + 1:02d}.m4a"
    shipped = best["score"] >= SHIP_AT
    if shipped:
        with tempfile.NamedTemporaryFile(suffix=".wav") as wav:
            scipy.io.wavfile.write(wav.name, voice.rate, (best["audio"] * 32767).astype(np.int16))
            subprocess.run(["afconvert", "-f", "m4af", "-d", "aac", "-b", "40000", wav.name, str(OUT_DIR / file)], check=True)
        manifest[name] = f"/audio/dishes/{file}" + stamp(OUT_DIR / file)
    report.append({"file": file, "name": name, "heard": best["heard"], "score": round(best["score"], 2), "shipped": shipped, "seed": best["seed"], "speed": best["speed"], "method": best["method"]})
    print(f"{file}  {best['score']:.2f}  {'    ' if shipped else 'HELD'}  {name}  ->  {best['heard']}", flush=True)

MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
print(f"\n{len(manifest)} of {len(report)} dish names have a clip.")
