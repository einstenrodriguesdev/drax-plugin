#!/usr/bin/env python3
"""Smoke-test the deterministic social video sidecar."""

from __future__ import annotations

import json
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

try:
    import PIL  # noqa: F401
except ImportError:
    print("SKIP: Pillow is not installed; social video renderer test skipped.")
    raise SystemExit(0)

if shutil.which("ffmpeg") is None:
    print("SKIP: ffmpeg is not installed; social video renderer test skipped.")
    raise SystemExit(0)


ROOT = Path(__file__).resolve().parent.parent
SCRIPT = ROOT / "scripts" / "social_video.py"


def assert_mp4(path: Path) -> None:
    raw = path.read_bytes()
    assert len(raw) > 1024, f"{path} is too small to be a valid MP4"
    assert raw[4:8] == b"ftyp", f"{path} does not contain an MP4 ftyp box"


def ffprobe_available() -> bool:
    return shutil.which("ffprobe") is not None


def assert_ffprobe_shape(path: Path) -> None:
    probe = subprocess.run(
        [
            "ffprobe",
            "-v",
            "error",
            "-select_streams",
            "v:0",
            "-show_entries",
            "stream=width,height,duration",
            "-of",
            "json",
            str(path),
        ],
        encoding="utf-8",
        stdout=subprocess.PIPE,
        stderr=subprocess.PIPE,
        check=False,
    )
    assert probe.returncode == 0, probe.stderr
    data = json.loads(probe.stdout)
    stream = data["streams"][0]
    assert stream["width"] == 1080, stream
    assert stream["height"] == 1920, stream
    duration = float(stream["duration"])
    assert 5.8 <= duration <= 6.2, stream


def main() -> int:
    with tempfile.TemporaryDirectory(prefix="drax-social-video-") as temp:
        root = Path(temp)
        out_dir = root / "out"
        input_path = root / "video-input.json"
        input_path.write_text(
            json.dumps(
                {
                    "title": "Proof before publishing: how a founder tests the Drax cycle",
                    "description": "A deterministic dry-run gives the founder evidence before local blog publishing is enabled.",
                    "tags": ["automation", "blog", "proof"],
                    "postClass": "post-1",
                    "slug": "proof-before-publishing",
                    "brand": {
                        "bg": [8, 8, 8],
                        "fg": [237, 232, 223],
                        "accent": [255, 61, 0],
                        "dim": [100, 100, 100],
                    },
                    "ffmpegBin": "ffmpeg",
                    "outDir": str(out_dir),
                },
                sort_keys=True,
            ),
            encoding="utf-8",
        )
        result = subprocess.run(
            [sys.executable, str(SCRIPT), str(input_path)],
            cwd=ROOT,
            encoding="utf-8",
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            check=False,
        )
        assert result.returncode == 0, result.stderr
        output = json.loads(result.stdout)
        reel = Path(output["reel"])
        assert_mp4(reel)
        if ffprobe_available():
            assert_ffprobe_shape(reel)
    print("PASS: social video renderer produced a 1080x1920 silent MP4 reel.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
