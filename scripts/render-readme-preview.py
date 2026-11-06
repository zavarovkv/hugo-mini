#!/usr/bin/env python3
"""Make a README GIF from real desktop and iPhone-sized Hugo Mini screenshots.

Authoring-only dependencies: Pillow, Playwright, and Chromium.
Run: python scripts/render-readme-preview.py [--url https://...]
"""

from __future__ import annotations

import argparse
from io import BytesIO
from pathlib import Path

from PIL import Image, ImageDraw
from playwright.sync_api import sync_playwright


CANVAS = (1020, 550)
DESKTOP = (22, 24, 770, 457)
PHONE = (770, 55, 214, 464)
TOP_SAFE_AREA = 26


def capture(url: str) -> dict[str, dict[str, Image.Image]]:
    shots: dict[str, dict[str, Image.Image]] = {}
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True)
        try:
            for mode in ("light", "dark"):
                shots[mode] = {}
                for device, width, height in (
                    ("desktop", 1050, 623),
                    ("phone", 390, 798),
                ):
                    is_phone = device == "phone"
                    context = browser.new_context(
                        viewport={"width": width, "height": height},
                        device_scale_factor=2,
                        color_scheme=mode,
                        is_mobile=is_phone,
                        has_touch=is_phone,
                        reduced_motion="reduce",
                    )
                    page = context.new_page()
                    page.goto(url, wait_until="networkidle", timeout=60000)
                    page.evaluate("document.fonts.ready")
                    applied = page.locator("html").get_attribute("data-theme")
                    if applied != mode:
                        raise RuntimeError(f"Expected {mode} theme, got {applied!r}")
                    screenshot = Image.open(BytesIO(page.screenshot())).convert("RGB")
                    if is_phone:
                        # Preserve the actual mobile layout and aspect ratio.
                        target = (PHONE[2], PHONE[3] - TOP_SAFE_AREA)
                    else:
                        target = (DESKTOP[2], DESKTOP[3])
                    shots[mode][device] = screenshot.resize(target, Image.Resampling.LANCZOS)
                    context.close()
        finally:
            browser.close()
    return shots


def rounded(screen: Image.Image, radius: int) -> Image.Image:
    alpha = Image.new("L", screen.size)
    ImageDraw.Draw(alpha).rounded_rectangle(
        (0, 0, screen.width - 1, screen.height - 1), radius=radius, fill=255
    )
    result = screen.convert("RGBA")
    result.putalpha(alpha)
    return result


def frame(shots: dict[str, Image.Image], mode: str) -> Image.Image:
    result = Image.new("RGBA", CANVAS, (0, 0, 0, 0))
    paint = ImageDraw.Draw(result)
    chrome = "#ffffff" if mode == "light" else "#1a1a1a"
    outline = "#dddddd" if mode == "light" else "#414141"
    dot = "#cacaca" if mode == "light" else "#676767"

    x, y, width, height = DESKTOP
    bar = 28
    paint.rounded_rectangle(
        (x, y, x + width - 1, y + bar + height - 1),
        radius=10, fill=chrome, outline=outline, width=1,
    )
    for dx in (16, 28, 40):
        paint.ellipse((x + dx - 3, y + 12, x + dx + 3, y + 18), fill=dot)
    paint.line((x, y + bar, x + width - 1, y + bar), fill=outline)
    result.alpha_composite(shots["desktop"].convert("RGBA"), (x, y + bar))

    # An understated iPhone silhouette with a Dynamic Island and real mobile
    # viewport content. The safe-area top is intentionally separate from the
    # website screenshot, so it does not hide the site's navigation.
    px, py, pw, ph = PHONE
    paint.rounded_rectangle(
        (px - 6, py - 6, px + pw + 5, py + ph + 5),
        radius=30, fill="#111316", outline="#414449", width=1,
    )
    inside = Image.new("RGBA", (pw, ph), chrome)
    inside.alpha_composite(shots["phone"].convert("RGBA"), (0, TOP_SAFE_AREA))
    result.alpha_composite(rounded(inside, 24), (px, py))
    paint = ImageDraw.Draw(result)
    paint.rounded_rectangle(
        (px + pw // 2 - 30, py + 6, px + pw // 2 + 30, py + 19),
        radius=7, fill="#070809",
    )
    return result


def animate(light: Image.Image, dark: Image.Image) -> tuple[list[Image.Image], list[int]]:
    frames = [light]
    durations = [2400]
    for a, b in ((light, dark), (dark, light)):
        for step in range(1, 9):
            t = step / 9
            frames.append(Image.blend(a, b, t * t * (3 - 2 * t)))
            durations.append(65)
        frames.append(b)
        durations.append(2400 if b is dark else 65)
    return frames, durations


def main() -> None:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--url", default="https://hugo-mini-demo.vercel.app/")
    parser.add_argument("--output", type=Path, default=Path("images/readme-preview-v3.gif"))
    parser.add_argument("--stills", type=Path, default=Path(".preview-stills"))
    args = parser.parse_args()

    shots = capture(args.url)
    light, dark = frame(shots["light"], "light"), frame(shots["dark"], "dark")
    args.stills.mkdir(parents=True, exist_ok=True)
    light.save(args.stills / "light.png")
    dark.save(args.stills / "dark.png")
    frames, durations = animate(light, dark)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    frames[0].save(
        args.output, save_all=True, append_images=frames[1:],
        duration=durations, loop=0, optimize=True, disposal=2,
    )
    print(f"Created {args.output} ({args.output.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
