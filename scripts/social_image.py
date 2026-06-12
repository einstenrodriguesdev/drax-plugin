#!/usr/bin/env python3
"""Render deterministic DRAX social images from a content package.

Contract:
  python3 scripts/social_image.py /path/to/image-input.json

The input JSON contains title, description, tags, postClass, slug, brand, and
outDir. The script writes social-vertical-1080x1920.png and
social-square-1080x1080.png to outDir, prints their paths as JSON to stdout,
and exits non-zero with a stderr message on failure.
"""

from __future__ import annotations

import json
import math
import os
import sys
from pathlib import Path
from typing import Any

try:
    from PIL import Image, ImageDraw, ImageFont
except ImportError as exc:
    print("Pillow is required for social image generation. Install with: python3 -m pip install -r requirements.txt", file=sys.stderr)
    raise SystemExit(2) from exc


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
) -> int:
    x, y = xy
    for line in lines:
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


def render_card(data: dict[str, Any], width: int, height: int, target: Path) -> None:
    brand_input = data.get("brand") if isinstance(data.get("brand"), dict) else {}
    bg = color(brand_input.get("bg"), DEFAULT_BRAND["bg"])
    fg = color(brand_input.get("fg"), DEFAULT_BRAND["fg"])
    accent = color(brand_input.get("accent"), DEFAULT_BRAND["accent"])
    dim = color(brand_input.get("dim"), DEFAULT_BRAND["dim"])

    image = Image.new("RGB", (width, height), bg)
    draw = ImageDraw.Draw(image)
    vertical = height > width
    margin = 88 if vertical else 70
    max_width = width - margin * 2

    kicker_font = load_font(MONO_CANDIDATES, 34 if vertical else 28)
    chip_font = load_font(MONO_CANDIDATES, 28 if vertical else 22)
    wordmark_font = load_font(BOLD_CANDIDATES, 34 if vertical else 28)

    post_class = str(data.get("postClass") or "post").upper()
    kicker = f"DRAX · {post_class}"
    draw_letter_spaced(draw, (margin, margin), kicker, kicker_font, accent, 2)

    title = str(data.get("title") or "Untitled").strip() or "Untitled"
    headline_font, headline_lines, headline_height = fit_lines(
        draw,
        title,
        BOLD_CANDIDATES,
        max_width,
        7 if vertical else 5,
        104 if vertical else 74,
        46 if vertical else 34,
    )
    headline_y = 270 if vertical else 190
    after_headline = draw_lines(draw, headline_lines, (margin, headline_y), headline_font, fg, headline_height)

    rule_y = after_headline + (54 if vertical else 34)
    draw.rectangle((margin, rule_y, margin + min(max_width, 260), rule_y + 8), fill=accent)

    description = first_sentence(str(data.get("description") or ""))
    subhead_font, subhead_lines, subhead_height = fit_lines(
        draw,
        description,
        REGULAR_CANDIDATES,
        max_width,
        3 if vertical else 2,
        46 if vertical else 34,
        28 if vertical else 22,
    )
    draw_lines(draw, subhead_lines, (margin, rule_y + (54 if vertical else 38)), subhead_font, fg, subhead_height)

    footer_y = height - (170 if vertical else 118)
    tags = data.get("tags") if isinstance(data.get("tags"), list) else []
    draw_chips(draw, [str(tag) for tag in tags], margin, footer_y, max_width - 210, chip_font, dim, fg)
    wordmark = "DRAX"
    wordmark_width = text_width(draw, wordmark, wordmark_font)
    draw.text((width - margin - wordmark_width, footer_y + 8), wordmark, font=wordmark_font, fill=accent)

    target.parent.mkdir(parents=True, exist_ok=True)
    image.save(target, format="PNG", optimize=False)


def main(argv: list[str]) -> int:
    if len(argv) != 2:
        print("usage: social_image.py /path/to/image-input.json", file=sys.stderr)
        return 2
    input_path = Path(argv[1]).resolve()
    with input_path.open("r", encoding="utf-8") as handle:
        data = json.load(handle)
    out_dir = Path(str(data.get("outDir") or "")).resolve()
    if not out_dir:
        print("outDir is required", file=sys.stderr)
        return 2
    os.makedirs(out_dir, exist_ok=True)

    vertical = out_dir / "social-vertical-1080x1920.png"
    square = out_dir / "social-square-1080x1080.png"
    render_card(data, 1080, 1920, vertical)
    render_card(data, 1080, 1080, square)
    print(json.dumps({"vertical": str(vertical), "square": str(square)}, sort_keys=True))
    return 0


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
