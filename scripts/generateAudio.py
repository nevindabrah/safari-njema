"""Speaks every seed phrase in Swahili and saves one small audio file each, plus a manifest the app reads.

Exists so lessons have a native sounding voice with no speech service, no API key and no cost at run time.
The main voice is Meta's MMS text to speech model for Swahili, licensed CC BY-NC 4.0: free for non-commercial use
with credit. If Safari Njema ever earns money, replace these clips with a commercial voice.

Run once, from the repo root, in a Python environment that has torch, transformers and scipy:
    python scripts/generateAudio.py                 one take per phrase, main voice only
    python scripts/generateAudio.py --judge         several takes per phrase. A Swahili speech recogniser listens to
                                                    each and the clearest is kept. Downloads a 4 GB model once.
    python scripts/generateAudio.py --judge --only-weak                  redo only clips the last report scored under 0.9
    python scripts/generateAudio.py --judge --only-weak --other-voices   and let other voices try those too

Short words are the hard case: the voice was trained on sentences. For those the word is also spoken three times and
the middle one cut out (see audioVoice.py). Other voices are only used where the main voice stays weak and another is
heard almost perfectly, so the lessons keep one main voice. Needs macOS for afconvert.
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

from audioVoice import SAY_AS, Voice

MAIN_VOICE = "facebook/mms-tts-swh"
# Community voices built on the same model. Compared across all 95 phrases they are weaker overall, but each wins a few.
OTHER_VOICES = ["Mwau/waxal_swahili-tts-mms", "mussacharles60/swahili-tts-female-voice", "stano03/jambogpt-swahili-tts-v1"]
LISTENER = "facebook/mms-1b-all"
OUT_DIR, MANIFEST, REPORT = Path("public/audio"), Path("src/features/audio/audioManifest.json"), Path("docs/audio-report.json")
SHIP_AT = 0.7    # a clip is only offered in the app if the recogniser heard at least this much of it correctly
WEAK_UNDER = 0.9  # below this a clip is retried, and other voices may have a go
OTHER_VOICE_NEEDS = 0.95  # another voice replaces the main one only if it is heard almost perfectly

JUDGE, ONLY_WEAK, USE_OTHERS = "--judge" in sys.argv, "--only-weak" in sys.argv, "--other-voices" in sys.argv
phrases = json.loads(Path("supabase/seed/phrases.json").read_text())
LIMIT = next((int(a) for a in sys.argv[1:] if a.isdigit()), len(phrases))

voices = {MAIN_VOICE: Voice(MAIN_VOICE)}
if JUDGE:
    processor = AutoProcessor.from_pretrained(LISTENER, target_lang="swh")
    listener = Wav2Vec2ForCTC.from_pretrained(LISTENER, target_lang="swh", ignore_mismatched_sizes=True)


def letters(text: str) -> str:
    """Only the letters, so "em pesa" and "empesa" count as the same thing heard."""
    for written, spoken in SAY_AS.items():
        text = text.replace(written, spoken)
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


def hear(audio: np.ndarray, rate: int) -> str:
    if rate != 16000:  # the recogniser expects 16 kHz
        audio = np.interp(np.arange(0, len(audio), rate / 16000), np.arange(len(audio)), audio).astype(np.float32)
    with torch.no_grad():
        ids = torch.argmax(listener(**processor(audio, sampling_rate=16000, return_tensors="pt")).logits, dim=-1)[0]
    return processor.decode(ids)


def single_words(swahili: str) -> bool:
    return all(" " not in part.strip() for half in swahili.split(" / ") for part in half.split(","))


def takes_for(swahili: str):
    """The main voice's settings to try, best guesses first: a first round, then a longer one only stubborn phrases reach."""
    if not JUDGE:
        return [(7, 0.88, True, 0.667, "alone")]
    comma_choices = [True, False] if "," in swahili else [True]
    first = [(seed, speed, commas, 0.667, "alone") for seed in (7, 21, 42) for speed in (0.88, 0.78) for commas in comma_choices]
    second = [(seed, speed, True, noise, "alone") for noise in (0.4, 0.2) for speed in (0.8, 0.7) for seed in (1, 2)]
    if single_words(swahili):  # the middle of three trick only makes sense when every part is a single word
        second = [(seed, speed, True, noise, m) for m in ("middle", "middle, quiet cut") for seed in (7, 21, 42) for speed in (0.88, 0.75) for noise in (0.667, 0.3)] + second
    return first + second


def judge(voice: Voice, swahili: str, take, best):
    seed, speed, commas, noise, method = take
    audio = voice.speak_phrase(swahili, seed, speed, commas, noise, method)
    heard = hear(audio, voice.rate) if JUDGE else ""
    score = similarity(letters(swahili), letters(heard)) if JUDGE else 0.0
    if best is None or score > best["score"]:
        return {"audio": audio, "rate": voice.rate, "heard": heard, "score": score, "take": {"voice": voice.model_id, "method": method, "seed": seed, "speed": speed, "split_commas": commas, "noise": noise}}
    return best


OUT_DIR.mkdir(parents=True, exist_ok=True)
previous = {r["swahili"]: r for r in json.loads(REPORT.read_text())} if REPORT.exists() else {}
manifest = json.loads(MANIFEST.read_text()) if MANIFEST.exists() and (LIMIT < len(phrases) or ONLY_WEAK) else {}
report = []
for index, phrase in enumerate(phrases[:LIMIT]):
    swahili = phrase["swahili"]
    if ONLY_WEAK and swahili in previous and previous[swahili]["score"] >= WEAK_UNDER:  # a good clip is left exactly as it is
        report.append(previous[swahili])
        continue
    best, first_round = None, 12 if "," in swahili else 6
    for number, take in enumerate(takes_for(swahili)):
        if (number == first_round and best["score"] >= 0.85) or (number > first_round and best["score"] >= 0.95):
            break
        best = judge(voices[MAIN_VOICE], swahili, take, best)
        if best["score"] == 1.0:
            break
    if JUDGE and USE_OTHERS and best["score"] < WEAK_UNDER:
        for model_id in OTHER_VOICES:
            if model_id not in voices:  # each extra voice is loaded once, the first time a weak clip needs it
                voices[model_id] = Voice(model_id)
            candidate = None
            for method in (["alone", "middle"] if single_words(swahili) else ["alone"]):
                for seed in (7, 21):
                    candidate = judge(voices[model_id], swahili, (seed, 0.88, True, 0.667, method), candidate)
            if candidate["score"] >= OTHER_VOICE_NEEDS and candidate["score"] > best["score"]:
                best = candidate
    name = f"{index + 1:03d}.m4a"
    if ONLY_WEAK and swahili in previous and previous[swahili]["score"] >= round(best["score"], 2) and (OUT_DIR / name).exists():
        report.append(previous[swahili])  # the retry was no better, so the clip already on disk stays
        print(f"{name}  kept at {previous[swahili]['score']:.2f}  {swahili}", flush=True)
        continue
    with tempfile.NamedTemporaryFile(suffix=".wav") as wav:
        scipy.io.wavfile.write(wav.name, best["rate"], (best["audio"] * 32767).astype(np.int16))
        subprocess.run(["afconvert", "-f", "m4af", "-d", "aac", "-b", "40000", wav.name, str(OUT_DIR / name)], check=True)
    shipped = not JUDGE or best["score"] >= SHIP_AT
    manifest.pop(swahili, None)
    if shipped:
        manifest[swahili] = f"/audio/{name}"
    report.append({"file": name, "swahili": swahili, "heard": best["heard"], "score": round(best["score"], 2), "shipped": shipped, "take": best["take"]})
    print(f"{name}  {best['score']:.2f}  {'    ' if shipped else 'HELD'}  {swahili}  ->  {best['heard']}   [{best['take']['voice'].split('/')[-1]}]", flush=True)

MANIFEST.parent.mkdir(parents=True, exist_ok=True)
MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
if JUDGE and LIMIT == len(phrases):
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    held = [r["swahili"] for r in report if not r["shipped"]]
    print(f"\n{len(report) - len(held)} of {len(report)} clips are in the app. Held back for a human to listen to: {held}. Full list in {REPORT}.")
print(f"Wrote {len(manifest)} clips to {OUT_DIR} and the manifest to {MANIFEST}.")
