#!/usr/bin/env python3
"""Render a deterministic DRAX vertical social reel from a content package.

Contract:
  python3 scripts/social_video.py /path/to/video-input.json

The input JSON contains title, description, tags, postClass, slug, brand,
ffmpegBin, and outDir. The script renders 90 Pillow frames at 1080x1920,
stitches them with FFmpeg at 15 fps into social-reel-1080x1920.mp4, prints the
written path as JSON to stdout, and exits non-zero with a stderr message on
failure. FFmpeg is invoked with bitexact flags, no metadata, fixed frame rate,
yuv420p pixels, and no audio track.
"""

from __future__ import annotations

import json
import math
import os
import shutil
import subprocess
import sys
from pathlib import Path
from typing import Any

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError as exc:
    print("Pillow is required for social video generation. Install with: python3 -m pip install -r requirements.txt", file=sys.stderr)
    raise SystemExit(2) from exc


WIDTH = 1080
HEIGHT = 1920
FPS = 15
FRAMES = 90

DEFAULT_BRAND = {
    "bg": (8, 8, 8),
    "fg": (237, 232, 223),
    "accent": (255, 61, 0),
    "dim": (100, 100, 100),
}

BOLD_CANDIDATES = [
    "Inter-Bold.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
]
REGULAR_CANDIDATES = [
    "Inter-Regular.ttf",
    "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
]
MONO_CANDIDATES = [
    "/usr/share/fonts/truetype/liberation/LiberationMono-Bold.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf",
]


def color(value: Any, fallback: tuple[int, int, int]) -> tuple[int, int, int]:
    if isinstance(value, (list, tuple)) and len(value) == 3:
        try:
            rgb = tuple(max(0, min(255, int(part))) for part in value)
        except (TypeError, ValueError):
            return fallback
        return rgb  # type: ignore[return-value]
    return fallback


def blend(start: tuple[int, int, int], end: tuple[int, int, int], amount: float) -> tuple[int, int, int]:
    ratio = max(0.0, min(1.0, amount))
    return tuple(int(round(start[index] + (end[index] - start[index]) * ratio)) for index in range(3))  # type: ignore[return-value]


def load_font(candidates: list[str], size: int) -> ImageFont.ImageFont:
    script_dir = Path(__file__).resolve().parent
    for candidate in candidates:
        for target in (Path(candidate), script_dir / candidate):
            try:
                if target.exists() or not target.is_absolute():
                    return ImageFont.truetype(str(target), size)
            except OSError:
                continue
    return ImageFont.load_default()


def text_bbox(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.ImageFont) -> tuple[int, int, int, int]:
    if not text:
        return (0, 0, 0, 0)
    return draw.textbbox((0, 0), text, font=font)


def text_width(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.ImageFont) -> int:
    box = text_bbox(draw, text, font)
    return max(0, box[2] - box[0])


def text_height(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.ImageFont) -> int:
    box = text_bbox(draw, text, font)
    return max(1, box[3] - box[1])


def ellipsize(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.ImageFont, max_width: int) -> str:
    text = text.strip()
    if text_width(draw, text, font) <= max_width:
        return text
    ellipsis = "..."
    if text_width(draw, ellipsis, font) > max_width:
        return ""
    low = 0
    high = len(text)
    while low < high:
        mid = math.ceil((low + high) / 2)
        if text_width(draw, f"{text[:mid].rstrip()}{ellipsis}", font) <= max_width:
            low = mid
        else:
            high = mid - 1
    return f"{text[:low].rstrip()}{ellipsis}"


def wrap_text(draw: ImageDraw.ImageDraw, text: str, font: ImageFont.ImageFont, max_width: int, max_lines: int) -> list[str]:
    words = text.strip().split()
    if not words:
        return []
    lines: list[str] = []
    current = ""
    for word in words:
        candidate = word if not current else f"{current} {word}"
        if text_width(draw, candidate, font) <= max_width:
            current = candidate
            continue
        if current:
            lines.append(current)
        else:
            lines.append(ellipsize(draw, word, font, max_width))
        current = word
        if len(lines) >= max_lines:
            break
    if len(lines) < max_lines and current:
        lines.append(current)
    if len(lines) > max_lines:
        lines = lines[:max_lines]
    if len(lines) == max_lines:
        remaining = " ".join(words)
        if " ".join(lines).strip() != remaining.strip():
            lines[-1] = ellipsize(draw, lines[-1], font, max_width)
    return lines


def fit_lines(
    draw: ImageDraw.ImageDraw,
    text: str,
    candidates: list[str],
    max_width: int,
    max_lines: int,
    start_size: int,
    min_size: int,
) -> tuple[ImageFont.ImageFont, list[str], int]:
    size = start_size
    while size >= min_size:
        font = load_font(candidates, size)
        lines = wrap_text(draw, text, font, max_width, max_lines)
        if len(lines) <= max_lines:
            line_height = int(text_height(draw, "Ag", font) * 1.18)
            return font, lines, max(1, line_height)
        size -= 4
    font = load_font(candidates, min_size)
    return font, wrap_text(draw, text, font, max_width, max_lines), max(1, int(text_height(draw, "Ag", font) * 1.18))


def first_sentence(value: str) -> str:
    text = " ".join(value.strip().split())
    for marker in (". ", "? ", "! "):
        index = text.find(marker)
        if index > 24:
            return text[: index + 1]
    return text


def ease(value: float) -> float:
    t = max(0.0, min(1.0, value))
    return t * t * (3.0 - 2.0 * t)


def stage(frame: int, start: int, end: int) -> float:
    if frame <= start:
        return 0.0
    if frame >= end:
        return 1.0
    return ease((frame - start) / max(1, end - start))


def draw_letter_spaced(
    draw: ImageDraw.ImageDraw,
    xy: tuple[int, int],
    text: str,
    font: ImageFont.ImageFont,
    fill: tuple[int, int, int],
    spacing: int,
) -> None:
    x, y = xy
    for char in text:
        draw.text((x, y), char, font=font, fill=fill)
        x += max(1, text_width(draw, char, font)) + spacing


def draw_lines(
    draw: ImageDraw.ImageDraw,
    lines: list[str],
    xy: tuple[int, int],
    font: ImageFont.ImageFont,
    fill: tuple[int, int, int],
    line_height: int,
    visible_lines: int,
) -> int:
    x, y = xy
    for line in lines[:visible_lines]:
        draw.text((x, y), line, font=font, fill=fill)
        y += line_height
    return y


def draw_chips(
    draw: ImageDraw.ImageDraw,
    tags: list[str],
    x: int,
    y: int,
    max_width: int,
    font: ImageFont.ImageFont,
    outline: tuple[int, int, int],
    fill: tuple[int, int, int],
) -> None:
    cursor = x
    for tag in [tag.strip() for tag in tags if tag.strip()][:3]:
        label = tag if tag.startswith("#") else f"#{tag}"
        label = ellipsize(draw, label, font, 240)
        chip_width = text_width(draw, label, font) + 34
        chip_height = text_height(draw, "Ag", font) + 18
        if cursor + chip_width > x + max_width:
            break
        draw.rounded_rectangle((cursor, y, cursor + chip_width, y + chip_height), radius=18, outline=outline, width=2)
        draw.text((cursor + 17, y + 8), label, font=font, fill=fill)
        cursor += chip_width + 14


def layout(data: dict[str, Any]) -> dict[str, Any]:
    image = Image.new("RGB", (WIDTH, HEIGHT), DEFAULT_BRAND["bg"])
    draw = ImageDraw.Draw(image)
    margin = 88
    max_width = WIDTH - margin * 2
    headline_font, headline_lines, headline_height = fit_lines(
        draw,
        str(data.get("title") or "Untitled").strip() or "Untitled",
        BOLD_CANDIDATES,
        max_width,
        7,
        104,
        46,
    )
    subhead_font, subhead_lines, subhead_height = fit_lines(
        draw,
        first_sentence(str(data.get("description") or "")),
        REGULAR_CANDIDATES,
        max_width,
        3,
        46,
        28,
    )
    return {
        "margin": margin,
        "maxWidth": max_width,
        "kickerFont": load_font(MONO_CANDIDATES, 34),
        "chipFont": load_font(MONO_CANDIDATES, 28),
        "wordmarkFont": load_font(BOLD_CANDIDATES, 34),
        "headlineFont": headline_font,
        "headlineLines": headline_lines,
        "headlineHeight": headline_height,
        "headlineY": 270,
        "subheadFont": subhead_font,
        "subheadLines": subhead_lines,
        "subheadHeight": subhead_height,
    }


def render_frame(data: dict[str, Any], spec: dict[str, Any], frame: int, target: Path) -> None:
    brand_input = data.get("brand") if isinstance(data.get("brand"), dict) else {}
    bg = color(brand_input.get("bg"), DEFAULT_BRAND["bg"])
    fg = color(brand_input.get("fg"), DEFAULT_BRAND["fg"])
    accent = color(brand_input.get("accent"), DEFAULT_BRAND["accent"])
    dim = color(brand_input.get("dim"), DEFAULT_BRAND["dim"])

    image = Image.new("RGB", (WIDTH, HEIGHT), bg)
    draw = ImageDraw.Draw(image)
    margin = int(spec["margin"])
    max_width = int(spec["maxWidth"])

    kicker_alpha = stage(frame, 0, 14)
    kicker_y = margin + int(round((1.0 - kicker_alpha) * 24))
    kicker = f"DRAX · {str(data.get('postClass') or 'post').upper()}"
    draw_letter_spaced(draw, (margin, kicker_y), kicker, spec["kickerFont"], blend(bg, accent, kicker_alpha), 2)

    headline_lines = list(spec["headlineLines"])
    visible_headline = 0
    for index in range(len(headline_lines)):
        if stage(frame, 10 + index * 5, 22 + index * 5) > 0.0:
            visible_headline = index + 1
    headline_alpha = stage(frame, 10, 42)
    headline_y = int(spec["headlineY"]) + int(round((1.0 - headline_alpha) * 32))
    after_headline = draw_lines(
        draw,
        headline_lines,
        (margin, headline_y),
        spec["headlineFont"],
        blend(bg, fg, headline_alpha),
        int(spec["headlineHeight"]),
        visible_headline,
    )
    if visible_headline == 0:
        after_headline = headline_y

    rule_y = after_headline + 54
    rule_progress = stage(frame, 38, 55)
    rule_width = int(round(min(max_width, 260) * rule_progress))
    if rule_width > 0:
        draw.rectangle((margin, rule_y, margin + rule_width, rule_y + 8), fill=accent)

    subhead_alpha = stage(frame, 48, 66)
    subhead_y = rule_y + 54 + int(round((1.0 - subhead_alpha) * 18))
    draw_lines(
        draw,
        list(spec["subheadLines"]),
        (margin, subhead_y),
        spec["subheadFont"],
        blend(bg, fg, subhead_alpha),
        int(spec["subheadHeight"]),
        len(spec["subheadLines"]),
    )

    footer_alpha = stage(frame, 60, 76)
    footer_y = HEIGHT - 170 + int(round((1.0 - footer_alpha) * 18))
    tags = data.get("tags") if isinstance(data.get("tags"), list) else []
    draw_chips(
        draw,
        [str(tag) for tag in tags],
        margin,
        footer_y,
        max_width - 210,
        spec["chipFont"],
        blend(bg, dim, footer_alpha),
        blend(bg, fg, footer_alpha),
    )
    wordmark = "DRAX"
    wordmark_width = text_width(draw, wordmark, spec["wordmarkFont"])
    draw.text((WIDTH - margin - wordmark_width, footer_y + 8), wordmark, font=spec["wordmarkFont"], fill=blend(bg, accent, footer_alpha))

    target.parent.mkdir(parents=True, exist_ok=True)
    image.save(target, format="PNG", optimize=False)


def ffmpeg_command(ffmpeg_bin: str, frames_dir: Path, out_path: Path, codec: str) -> list[str]:
    return [
        ffmpeg_bin,
        "-y",
        "-fflags",
        "+bitexact",
        "-r",
        str(FPS),
        "-i",
        str(frames_dir / "frame-%04d.png"),
        "-c:v",
        codec,
        "-pix_fmt",
        "yuv420p",
        "-flags:v",
        "+bitexact",
        "-map_metadata",
        "-1",
        "-an",
        "-r",
        str(FPS),
        str(out_path),
    ]


def stderr_tail(value: str) -> str:
    return "\n".join(value.strip().splitlines()[-12:])


def encode_video(ffmpeg_bin: str, frames_dir: Path, out_path: Path) -> None:
    first = subprocess.run(
        ffmpeg_command(ffmpeg_bin, frames_dir, out_path, "libx264"),
        check=False,
        capture_output=True,
        text=True,
    )
    if first.returncode == 0:
        return
    second = subprocess.run(
        ffmpeg_command(ffmpeg_bin, frames_dir, out_path, "mpeg4"),
        check=False,
        capture_output=True,
        text=True,
    )
    if second.returncode == 0:
        return
    raise RuntimeError(
        "ffmpeg failed with libx264 and mpeg4 encoders.\n"
        f"[libx264 stderr]\n{stderr_tail(first.stderr)}\n"
        f"[mpeg4 stderr]\n{stderr_tail(second.stderr)}"
    )


def main(argv: list[str]) -> int:
    if len(argv) != 2:
        print("usage: social_video.py /path/to/video-input.json", file=sys.stderr)
        return 2
    input_path = Path(argv[1]).resolve()
    with input_path.open("r", encoding="utf-8") as handle:
        data = json.load(handle)
    out_dir = Path(str(data.get("outDir") or "")).resolve()
    if not out_dir:
        print("outDir is required", file=sys.stderr)
        return 2
    ffmpeg_bin = str(data.get("ffmpegBin") or "ffmpeg")
    out_dir.mkdir(parents=True, exist_ok=True)
    frames_dir = out_dir / "_reel-frames"
    if frames_dir.exists():
        shutil.rmtree(frames_dir)
    frames_dir.mkdir(parents=True, exist_ok=True)

    spec = layout(data)
    for frame in range(FRAMES):
        render_frame(data, spec, frame, frames_dir / f"frame-{frame:04d}.png")

    out_path = out_dir / "social-reel-1080x1920.mp4"
    encode_video(ffmpeg_bin, frames_dir, out_path)
    shutil.rmtree(frames_dir)
    print(json.dumps({"reel": str(out_path)}, sort_keys=True))
    return 0


if __name__ == "__main__":
    try:
        raise SystemExit(main(sys.argv))
    except Exception as exc:
        print(str(exc), file=sys.stderr)
        raise SystemExit(1)
