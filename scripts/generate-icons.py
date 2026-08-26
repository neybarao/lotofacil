from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
OUTPUT = ROOT / "public" / "icons"
OUTPUT.mkdir(parents=True, exist_ok=True)


def build_icon(size: int) -> None:
    image = Image.new("RGB", (size, size), "#f4f2ed")
    draw = ImageDraw.Draw(image)
    margin = round(size * 0.16)
    radius = round(size * 0.11)
    draw.rounded_rectangle(
        (margin, margin, size - margin, size - margin),
        radius=radius,
        fill="#242622",
    )
    dot_size = round(size * 0.19)
    gap = round(size * 0.075)
    block = dot_size * 2 + gap
    start = (size - block) // 2
    colors = ["#f8f6f0", "#f8f6f0", "#f8f6f0", "#67ad82"]
    for index, color in enumerate(colors):
        x = start + (index % 2) * (dot_size + gap)
        y = start + (index // 2) * (dot_size + gap)
        draw.ellipse((x, y, x + dot_size, y + dot_size), fill=color)
    image.save(OUTPUT / f"icon-{size}.png", optimize=True)


for icon_size in (192, 512):
    build_icon(icon_size)
