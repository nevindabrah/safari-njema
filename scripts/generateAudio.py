"""Speaks every seed phrase in Swahili and saves one small audio file each, plus a manifest the app reads.

Exists so lessons have a native sounding voice with no speech service, no API key and no cost at run time.
The voice is Meta's MMS text to speech model for Swahili (facebook/mms-tts-swh), licensed CC BY-NC 4.0:
free for non-commercial use with credit. If Safari Njema ever earns money, replace this with a commercial voice.

Run once, from the repo root, in a Python environment that has torch, transformers and scipy:
    python scripts/generateAudio.py            one take per phrase
    python scripts/generateAudio.py --judge 5  the same, for the first five phrases only, as a quick test
    python scripts/generateAudio.py --judge    several takes per phrase. A Swahili speech recogniser listens to each
                                               and the clearest one is kept. Slower, and downloads a 4 GB model once.
    python scripts/generateAudio.py --judge --only-weak   redo only the clips the last report scored under 0.9

Short words are the hard case. The voice was trained on sentences, so a lone word is unusual input and often comes out
unclear. For those, the word is also spoken three times in a row and the middle one is cut out, which gives it natural
flow on both sides. The model's own predicted timing says where to cut, optionally nudged to the quietest instant nearby.
Needs macOS for afconvert, which turns the WAV files into small AAC files every browser can play.
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
from transformers import AutoProcessor, AutoTokenizer, VitsModel, Wav2Vec2ForCTC

VOICE = "facebook/mms-tts-swh"
LISTENER = "facebook/mms-1b-all"
OUT_DIR = Path("public/audio")
MANIFEST = Path("src/features/audio/audioManifest.json")
REPORT = Path("docs/audio-report.json")

# A clip is only offered in the app if the recogniser heard at least this much of the phrase correctly.
# A phrase with no clip simply has no speaker button. Better silent than teaching a wrong sound.
SHIP_AT = 0.7

# Spellings used only for the voice, where the written form would be read wrongly. What learners see never changes.
SAY_AS = {"M-Pesa": "em pesa"}

JUDGE = "--judge" in sys.argv
ONLY_WEAK = "--only-weak" in sys.argv
phrases = json.loads(Path("supabase/seed/phrases.json").read_text())
LIMIT = next((int(a) for a in sys.argv[1:] if a.isdigit()), len(phrases))

tokenizer = AutoTokenizer.from_pretrained(VOICE)
voice = VitsModel.from_pretrained(VOICE)
rate = voice.config.sampling_rate
hop = int(np.prod(voice.config.upsample_rates))  # audio samples per frame of the model's timing
# Keep the timing the model predicts for each character, so a word can be cut out of a longer stretch of speech.
timing = {}
voice.duration_predictor.register_forward_hook(lambda module, args, output: timing.__setitem__("log", output.detach()))
if JUDGE:
    processor = AutoProcessor.from_pretrained(LISTENER, target_lang="swh")
    listener = Wav2Vec2ForCTC.from_pretrained(LISTENER, target_lang="swh", ignore_mismatched_sizes=True)


def silence(seconds: float) -> np.ndarray:
    return np.zeros(int(rate * seconds), dtype=np.float32)


def speak(text: str, seed: int, speed: float, noise: float) -> np.ndarray:
    """One stretch of speech with no pause inside it. The model adds randomness: the seed picks the take, and less noise is crisper."""
    for written, spoken in SAY_AS.items():
        text = text.replace(written, spoken)
    voice.speaking_rate = speed
    voice.noise_scale = noise
    torch.manual_seed(seed)
    with torch.no_grad():
        return voice(**tokenizer(text, return_tensors="pt")).waveform[0].numpy()


def middle_of_three(word: str, seed: int, speed: float, noise: float, snap: bool) -> np.ndarray:
    """Say the word three times and keep the middle one. snap moves each cut to the quietest instant within 90 ms."""
    wave = speak(f"{word} {word} {word}", seed, speed, noise)
    ends = np.cumsum(torch.ceil(torch.exp(timing["log"][0, 0]) / speed).numpy()) * hop  # where each token ends, in samples
    chars = (len(tokenizer(word).input_ids) - 1) // 2  # the tokenizer puts a blank token between every character
    start, stop = int(ends[2 * (chars + 1) - 1]), int(min(ends[2 * (2 * chars + 1)], len(wave)))

    def quietest(near: int) -> int:
        window, reach = int(rate * 0.012), int(rate * 0.09)
        low, high = max(0, near - reach), min(len(wave) - window, near + reach)
        energy = [float(np.mean(wave[i:i + window] ** 2)) for i in range(low, high, window // 2)]
        return low + int(np.argmin(energy)) * (window // 2) + window // 2

    if snap and quietest(stop) - quietest(start) >= int(rate * 0.18):  # on a tiny word the quiet spots can collide
        start, stop = quietest(start), quietest(stop)
    piece = wave[start:stop].copy()
    fade = min(int(rate * 0.012), max(1, len(piece) // 4))
    piece[:fade] *= np.linspace(0, 1, fade)
    piece[-fade:] *= np.linspace(1, 0, fade)
    return piece


def speak_phrase(swahili: str, seed: int, speed: float, split_commas: bool, noise: float, method: str = "alone") -> np.ndarray:
    """A pair like "Kushoto / Kulia" gets a clear pause between its halves. A list can get a short pause at each comma."""
    pieces = []
    halves = [h.strip() for h in swahili.split(" / ")]
    for h, half in enumerate(halves):
        parts = [p.strip() for p in half.split(",") if p.strip()] if split_commas else [half]
        for p, part in enumerate(parts):
            pieces.append(speak(part, seed, speed, noise) if method == "alone" else middle_of_three(part, seed, speed, noise, method == "middle, quiet cut"))
            if p < len(parts) - 1:
                pieces.append(silence(0.22))
        if h < len(halves) - 1:
            pieces.append(silence(0.55))
    audio = np.concatenate([silence(0.08), *pieces, silence(0.08)])
    return audio / max(np.abs(audio).max(), 1e-6) * 0.9


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


def hear(audio: np.ndarray) -> str:
    inputs = processor(audio, sampling_rate=rate, return_tensors="pt")
    with torch.no_grad():
        ids = torch.argmax(listener(**inputs).logits, dim=-1)[0]
    return processor.decode(ids)


def takes_for(swahili: str):
    """The settings to try, best guesses first. Without the judge there is one. With it, a first round of six or so,
    then a longer second round that only stubborn phrases ever reach: more seeds, slower, and less noise for crisper sounds."""
    if not JUDGE:
        return [(7, 0.88, True, 0.667, "alone")]
    comma_choices = [True, False] if "," in swahili else [True]
    first = [(seed, speed, commas, 0.667, "alone") for seed in (7, 21, 42) for speed in (0.88, 0.78) for commas in comma_choices]
    second = [(seed, speed, True, noise, "alone") for noise in (0.4, 0.2) for speed in (0.8, 0.7) for seed in (1, 2)]
    # The middle of three trick only makes sense when every part of the phrase is a single word.
    parts = [p for half in swahili.split(" / ") for p in half.split(",")]
    if all(" " not in p.strip() for p in parts):
        second = [(seed, speed, True, noise, method) for method in ("middle", "middle, quiet cut") for seed in (7, 21, 42) for speed in (0.88, 0.75) for noise in (0.667, 0.3)] + second
    return first + second


OUT_DIR.mkdir(parents=True, exist_ok=True)
previous = {r["swahili"]: r for r in json.loads(REPORT.read_text())} if REPORT.exists() else {}
manifest = json.loads(MANIFEST.read_text()) if MANIFEST.exists() and (LIMIT < len(phrases) or ONLY_WEAK) else {}
report = []
for index, phrase in enumerate(phrases[:LIMIT]):
    swahili = phrase["swahili"]
    # With --only-weak, a clip that already scored well is left exactly as it is.
    if ONLY_WEAK and swahili in previous and previous[swahili]["score"] >= 0.9:
        report.append(previous[swahili])
        continue
    best = None
    for number, (seed, speed, commas, noise, method) in enumerate(takes_for(swahili)):
        # The second round is only for phrases the first round could not get across. Once in it, keep going until a take is nearly perfect.
        first_round = 12 if "," in swahili else 6
        if (number == first_round and best["score"] >= 0.85) or (number > first_round and best["score"] >= 0.95):
            break
        audio = speak_phrase(swahili, seed, speed, commas, noise, method)
        heard = hear(audio) if JUDGE else ""
        score = similarity(letters(swahili), letters(heard)) if JUDGE else 0.0
        if best is None or score > best["score"]:
            best = {"audio": audio, "heard": heard, "score": score, "take": {"method": method, "seed": seed, "speed": speed, "split_commas": commas, "noise": noise}}
        if score == 1.0:
            break
    name = f"{index + 1:03d}.m4a"
    with tempfile.NamedTemporaryFile(suffix=".wav") as wav:
        scipy.io.wavfile.write(wav.name, rate, (best["audio"] * 32767).astype(np.int16))
        subprocess.run(["afconvert", "-f", "m4af", "-d", "aac", "-b", "40000", wav.name, str(OUT_DIR / name)], check=True)
    shipped = not JUDGE or best["score"] >= SHIP_AT
    if shipped:
        manifest[swahili] = f"/audio/{name}"
    else:
        manifest.pop(swahili, None)
    report.append({"file": name, "swahili": swahili, "heard": best["heard"], "score": round(best["score"], 2), "shipped": shipped, "take": best["take"]})
    print(f"{name}  {best['score']:.2f}  {'    ' if shipped else 'HELD'}  {swahili}  ->  {best['heard']}", flush=True)

MANIFEST.parent.mkdir(parents=True, exist_ok=True)
MANIFEST.write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
if JUDGE and LIMIT == len(phrases):
    REPORT.parent.mkdir(parents=True, exist_ok=True)
    REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2) + "\n")
    held = [r["swahili"] for r in report if not r["shipped"]]
    print(f"\n{len(report) - len(held)} of {len(report)} clips are in the app. Held back for a human to listen to: {held}. Full list in {REPORT}.")
print(f"Wrote {len(manifest)} clips to {OUT_DIR} and the manifest to {MANIFEST}.")
