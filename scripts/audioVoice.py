"""One Swahili text to speech voice: load it, and speak a phrase with it in a few different ways.

Exists so generateAudio.py can try several voices without repeating itself. Every voice here is a VITS model in the
Hugging Face transformers format, which is what Meta's MMS voices and the community voices built on them use.
"""
import numpy as np
import torch
from transformers import AutoTokenizer, VitsModel

# Spellings used only for the voice, where the written form would be read wrongly. What learners see never changes.
SAY_AS = {"M-Pesa": "em pesa"}


class Voice:
    def __init__(self, model_id: str):
        self.model_id = model_id
        self.tokenizer = AutoTokenizer.from_pretrained(model_id)
        self.model = VitsModel.from_pretrained(model_id)
        self.rate = self.model.config.sampling_rate
        self.hop = int(np.prod(self.model.config.upsample_rates))  # audio samples per frame of the model's timing
        # Keep the timing the model predicts for each character, so a word can be cut out of a longer stretch of speech.
        self.timing = {}
        self.model.duration_predictor.register_forward_hook(lambda module, args, output: self.timing.__setitem__("log", output.detach()))

    def silence(self, seconds: float) -> np.ndarray:
        return np.zeros(int(self.rate * seconds), dtype=np.float32)

    def speak(self, text: str, seed: int, speed: float, noise: float) -> np.ndarray:
        """One stretch of speech with no pause inside it. The seed picks the take, and less noise is crisper."""
        for written, spoken in SAY_AS.items():
            text = text.replace(written, spoken)
        self.model.speaking_rate = speed
        self.model.noise_scale = noise
        torch.manual_seed(seed)
        with torch.no_grad():
            return self.model(**self.tokenizer(text, return_tensors="pt")).waveform[0].numpy()

    def middle_of_three(self, word: str, seed: int, speed: float, noise: float, snap: bool) -> np.ndarray:
        """Say the word three times and keep the middle one, which has natural flow on both sides.
        The model's predicted timing says where to cut. snap moves each cut to the quietest instant within 90 ms."""
        wave = self.speak(f"{word} {word} {word}", seed, speed, noise)
        ends = np.cumsum(torch.ceil(torch.exp(self.timing["log"][0, 0]) / speed).numpy()) * self.hop
        chars = (len(self.tokenizer(word).input_ids) - 1) // 2  # the tokenizer puts a blank token between every character
        first, last = min(2 * (chars + 1) - 1, len(ends) - 1), min(2 * (2 * chars + 1), len(ends) - 1)
        start, stop = int(ends[first]), int(min(ends[last], len(wave)))

        def quietest(near: int) -> int:
            window, reach = int(self.rate * 0.012), int(self.rate * 0.09)
            low, high = max(0, near - reach), min(len(wave) - window, near + reach)
            energy = [float(np.mean(wave[i:i + window] ** 2)) for i in range(low, high, window // 2)]
            return low + int(np.argmin(energy)) * (window // 2) + window // 2

        if snap and quietest(stop) - quietest(start) >= int(self.rate * 0.18):  # on a tiny word the quiet spots can collide
            start, stop = quietest(start), quietest(stop)
        piece = wave[start:stop].copy()
        if len(piece) < self.rate * 0.12:  # the cut went wrong. Say the word on its own instead.
            return self.speak(word, seed, speed, noise)
        fade = min(int(self.rate * 0.012), max(1, len(piece) // 4))
        piece[:fade] *= np.linspace(0, 1, fade)
        piece[-fade:] *= np.linspace(1, 0, fade)
        return piece

    def speak_phrase(self, swahili: str, seed: int, speed: float, split_commas: bool, noise: float, method: str = "alone") -> np.ndarray:
        """A pair like "Kushoto / Kulia" gets a clear pause between its halves. A list can get a short pause at each comma."""
        pieces = []
        halves = [h.strip() for h in swahili.split(" / ")]
        for h, half in enumerate(halves):
            parts = [p.strip() for p in half.split(",") if p.strip()] if split_commas else [half]
            for p, part in enumerate(parts):
                pieces.append(self.speak(part, seed, speed, noise) if method == "alone" else self.middle_of_three(part, seed, speed, noise, method == "middle, quiet cut"))
                if p < len(parts) - 1:
                    pieces.append(self.silence(0.22))
            if h < len(halves) - 1:
                pieces.append(self.silence(0.55))
        audio = np.concatenate([self.silence(0.08), *pieces, self.silence(0.08)])
        return audio / max(np.abs(audio).max(), 1e-6) * 0.9
