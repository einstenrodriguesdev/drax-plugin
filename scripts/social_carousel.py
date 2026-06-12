#!/usr/bin/env python3
"""Render deterministic DRAX SVG carousel, story, and highlight assets."""

from __future__ import annotations

import html
import json
import re
import subprocess
import sys
from pathlib import Path
from typing import Any


FONT = "Inter, 'Liberation Sans', 'DejaVu Sans', sans-serif"
SVG_NS = "http://www.w3.org/2000/svg"


def clean_text(value: Any) -> str:
    return re.sub(r"\s+", " ", str(value or "")).strip()


def esc(value: str) -> str:
    return html.escape(value, quote=True)


def color(value: Any, fallback: tuple[int, int, int]) -> str:
    if not isinstance(value, list) or len(value) != 3:
        parts = fallback
    else:
        try:
            parts = tuple(max(0, min(255, int(part))) for part in value)
        except (TypeError, ValueError):
            parts = fallback
    return f"#{parts[0]:02x}{parts[1]:02x}{parts[2]:02x}"


def brand_colors(brand: dict[str, Any]) -> dict[str, str]:
    return {
        "bg": color(brand.get("bg"), (8, 8, 8)),
        "fg": color(brand.get("fg"), (237, 232, 223)),
        "accent": color(brand.get("accent"), (255, 61, 0)),
        "dim": color(brand.get("dim"), (100, 100, 100)),
    }


def wrap_text(value: str, width: int, max_lines: int) -> list[str]:
    words = clean_text(value).split()
    if not words:
        return []
    lines: list[str] = []
    current = ""
    for word in words:
        candidate = word if not current else f"{current} {word}"
        if len(candidate) <= width:
            current = candidate
            continue
        if current:
            lines.append(current)
        current = word
        if len(lines) == max_lines:
            break
    if current and len(lines) < max_lines:
        lines.append(current)
    if len(lines) == max_lines and words:
        consumed = " ".join(lines).split()
        if len(consumed) < len(words):
            lines[-1] = lines[-1].rstrip(".,;:") + "..."
    return lines


def text_block(
    lines: list[str],
    x: int,
    y: int,
    size: int,
    fill: str,
    weight: int = 500,
    line_height: int | None = None,
    anchor: str = "start",
) -> str:
    if not lines:
        return ""
    spacing = line_height or int(size * 1.18)
    tspans = []
    for index, line in enumerate(lines):
        dy = "0" if index == 0 else str(spacing)
        tspans.append(f'<tspan x="{x}" dy="{dy}">{esc(line)}</tspan>')
    return (
        f'<text x="{x}" y="{y}" fill="{fill}" font-family="{FONT}" '
        f'font-size="{size}" font-weight="{weight}" text-anchor="{anchor}">'
        f'{"".join(tspans)}</text>'
    )


def svg_root(width: int, height: int, body: list[str]) -> str:
    return "\n".join(
        [
            f'<svg xmlns="{SVG_NS}" width="{width}" height="{height}" viewBox="0 0 {width} {height}" role="img">',
            *body,
            "</svg>",
            "",
        ]
    )


def base_body(width: int, height: int, colors: dict[str, str]) -> list[str]:
    return [
        f'<rect width="{width}" height="{height}" fill="{colors["bg"]}"/>',
        f'<rect x="54" y="54" width="{width - 108}" height="{height - 108}" fill="none" stroke="{colors["dim"]}" stroke-width="2" opacity="0.28"/>',
    ]


def slide_hook(title: str, slug: str, colors: dict[str, str]) -> str:
    body = base_body(1080, 1080, colors)
    body.append(f'<text x="86" y="142" fill="{colors["accent"]}" font-family="{FONT}" font-size="32" font-weight="800" letter-spacing="3">DRAX &#183; PLAYBOOK</text>')
    body.append(text_block(wrap_text(title, 20, 5), 86, 318, 82, colors["fg"], 800, 96))
    body.append(f'<rect x="86" y="808" width="230" height="12" fill="{colors["accent"]}"/>')
    body.append(f'<text x="86" y="892" fill="{colors["dim"]}" font-family="{FONT}" font-size="30" font-weight="600">/{esc(slug)} &#183; @drax</text>')
    return svg_root(1080, 1080, body)


def slide_point(point: str, number: int, total: int, colors: dict[str, str]) -> str:
    body = base_body(1080, 1080, colors)
    body.append(f'<text x="84" y="160" fill="{colors["accent"]}" font-family="{FONT}" font-size="88" font-weight="900">{number:02d}</text>')
    body.append(f'<text x="228" y="145" fill="{colors["dim"]}" font-family="{FONT}" font-size="26" font-weight="700">SLIDE {number + 1:02d}/{total:02d}</text>')
    body.append(text_block(wrap_text(point, 22, 5), 86, 362, 74, colors["fg"], 800, 88))
    body.append(f'<text x="870" y="930" fill="{colors["dim"]}" font-family="{FONT}" font-size="26" font-weight="700">SWIPE</text>')
    body.append(f'<path d="M970 912 L1005 930 L970 948" fill="none" stroke="{colors["accent"]}" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>')
    return svg_root(1080, 1080, body)


def slide_cta(cta_url: str, colors: dict[str, str]) -> str:
    body = base_body(1080, 1080, colors)
    body.append(f'<text x="86" y="176" fill="{colors["accent"]}" font-family="{FONT}" font-size="44" font-weight="900">DRAX</text>')
    body.append(text_block(["Turn the idea", "into the next", "published proof."], 86, 356, 78, colors["fg"], 800, 92))
    body.append(f'<rect x="86" y="754" width="760" height="98" rx="49" fill="{colors["accent"]}"/>')
    body.append(f'<text x="136" y="817" fill="{colors["bg"]}" font-family="{FONT}" font-size="32" font-weight="900">{esc(cta_url)}</text>')
    body.append(f'<text x="86" y="938" fill="{colors["dim"]}" font-family="{FONT}" font-size="28" font-weight="600">Save this before your next cycle.</text>')
    return svg_root(1080, 1080, body)


def story_svg(title: str, description: str, cta_url: str, colors: dict[str, str]) -> str:
    body = base_body(1080, 1920, colors)
    body.append(f'<text x="86" y="168" fill="{colors["accent"]}" font-family="{FONT}" font-size="46" font-weight="900">DRAX</text>')
    body.append(text_block(wrap_text(title, 18, 6), 86, 476, 86, colors["fg"], 850, 102))
    subhead = first_sentence(description) or "Build the proof before you scale the channel."
    body.append(text_block(wrap_text(subhead, 30, 3), 86, 1168, 42, colors["dim"], 650, 56))
    body.append(f'<rect x="86" y="1530" width="720" height="108" rx="54" fill="{colors["accent"]}"/>')
    body.append(f'<text x="140" y="1598" fill="{colors["bg"]}" font-family="{FONT}" font-size="34" font-weight="900">Link in bio &#183; {esc(cta_url)}</text>')
    return svg_root(1080, 1920, body)


def category(post_class: str) -> str:
    lower = post_class.lower()
    if "proof" in lower or "case" in lower or "story" in lower:
        return "PROOF"
    if "guide" in lower or "how" in lower:
        return "GUIDE"
    return "PLAYBOOK"


def highlight_svg(post_class: str, colors: dict[str, str]) -> str:
    body = [f'<rect width="1080" height="1080" fill="{colors["bg"]}"/>']
    body.append(f'<circle cx="540" cy="540" r="378" fill="none" stroke="{colors["dim"]}" stroke-width="3" opacity="0.34"/>')
    body.append(f'<text x="540" y="520" fill="{colors["accent"]}" font-family="{FONT}" font-size="96" font-weight="950" text-anchor="middle">DRAX</text>')
    body.append(f'<text x="540" y="612" fill="{colors["fg"]}" font-family="{FONT}" font-size="38" font-weight="800" text-anchor="middle" letter-spacing="5">{category(post_class)}</text>')
    return svg_root(1080, 1080, body)


def first_sentence(value: str) -> str:
    normalized = clean_text(value)
    if not normalized:
        return ""
    match = re.search(r"(.+?[.!?])(?:\s|$)", normalized)
    return clean_text(match.group(1) if match else normalized)


def rasterizer_available(rsvg_bin: str) -> bool:
    if not rsvg_bin:
        return False
    try:
        result = subprocess.run(
            [rsvg_bin, "--version"],
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
            check=False,
        )
    except OSError:
        return False
    return result.returncode == 0


def rasterize(rsvg_bin: str, svgs: list[Path]) -> list[Path]:
    if not rasterizer_available(rsvg_bin):
        return []
    pngs: list[Path] = []
    for svg in svgs:
        png = svg.with_suffix(".png")
        text = svg.read_text(encoding="utf-8")
        width = "1080"
        height = "1920" if 'height="1920"' in text else "1080"
        try:
            result = subprocess.run(
                [rsvg_bin, "-w", width, "-h", height, str(svg), "-o", str(png)],
                stdout=subprocess.PIPE,
                stderr=subprocess.PIPE,
                check=False,
            )
        except OSError:
            for written in pngs:
                written.unlink(missing_ok=True)
            return []
        if result.returncode != 0 or not png.exists():
            for written in [*pngs, png]:
                written.unlink(missing_ok=True)
            return []
        pngs.append(png)
    return pngs


def write_outputs(data: dict[str, Any]) -> dict[str, Any]:
    out_dir = Path(clean_text(data.get("outDir"))).resolve()
    out_dir.mkdir(parents=True, exist_ok=True)

    title = clean_text(data.get("title")) or "Founder playbook"
    description = clean_text(data.get("description"))
    points = [clean_text(point)[:90].rstrip() for point in data.get("points", []) if clean_text(point)]
    points = points[:5] or [first_sentence(description) or title]
    slug = clean_text(data.get("slug")) or "post"
    post_class = clean_text(data.get("postClass")) or "post"
    cta_url = clean_text(data.get("ctaUrl")) or f"/{slug}"
    colors = brand_colors(data.get("brand") if isinstance(data.get("brand"), dict) else {})

    total = 1 + len(points) + 1
    svgs: list[Path] = []
    hook = out_dir / "carousel-01.svg"
    hook.write_text(slide_hook(title, slug, colors), encoding="utf-8", newline="\n")
    svgs.append(hook)
    for index, point in enumerate(points, start=1):
        slide = out_dir / f"carousel-{index + 1:02d}.svg"
        slide.write_text(slide_point(point, index, total, colors), encoding="utf-8", newline="\n")
        svgs.append(slide)
    cta = out_dir / f"carousel-{total:02d}.svg"
    cta.write_text(slide_cta(cta_url, colors), encoding="utf-8", newline="\n")
    svgs.append(cta)

    story = out_dir / "story.svg"
    story.write_text(story_svg(title, description, cta_url, colors), encoding="utf-8", newline="\n")
    svgs.append(story)

    highlight = out_dir / "highlight-cover.svg"
    highlight.write_text(highlight_svg(post_class, colors), encoding="utf-8", newline="\n")
    svgs.append(highlight)

    pngs = rasterize(clean_text(data.get("rsvgBin")), svgs)
    return {
        "svgs": [str(svg) for svg in svgs],
        "pngs": [str(png) for png in pngs],
        "rasterized": bool(pngs),
        "slides": total,
    }


def main(argv: list[str]) -> int:
    if len(argv) != 2:
        print("usage: social_carousel.py /path/to/carousel-input.json", file=sys.stderr)
        return 2
    try:
        data = json.loads(Path(argv[1]).read_text(encoding="utf-8"))
        if not isinstance(data, dict):
            raise ValueError("input JSON must be an object")
        print(json.dumps(write_outputs(data), sort_keys=True, separators=(",", ":")))
        return 0
    except Exception as error:  # noqa: BLE001 - surfaced to TypeScript as non-fatal hook error.
        print(str(error), file=sys.stderr)
        return 1


if __name__ == "__main__":
    raise SystemExit(main(sys.argv))
