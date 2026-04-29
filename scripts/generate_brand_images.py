from pathlib import Path

from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont


ROOT = Path(r"C:\Users\USER\Documents\New project")
ASSETS = ROOT / "public" / "assets"


def load_font(path: str, size: int) -> ImageFont.FreeTypeFont:
    return ImageFont.truetype(path, size=size)


TITLE_FONT = load_font(r"C:\Windows\Fonts\georgiab.ttf", 66)
SUBTITLE_FONT = load_font(r"C:\Windows\Fonts\arial.ttf", 28)
LABEL_FONT = load_font(r"C:\Windows\Fonts\arialbd.ttf", 18)


def cover_crop(image: Image.Image, width: int, height: int) -> Image.Image:
    ratio = max(width / image.width, height / image.height)
    resized = image.resize(
        (int(image.width * ratio), int(image.height * ratio)),
        Image.Resampling.LANCZOS,
    )
    left = (resized.width - width) // 2
    top = (resized.height - height) // 2
    return resized.crop((left, top, left + width, top + height))


def draw_multiline(
    draw: ImageDraw.ImageDraw,
    text: str,
    position: tuple[int, int],
    font: ImageFont.FreeTypeFont,
    fill: tuple[int, int, int],
    max_width: int,
    line_gap: int = 10,
) -> int:
    words = text.split()
    lines: list[str] = []
    current = []

    for word in words:
      trial = " ".join(current + [word])
      if draw.textlength(trial, font=font) <= max_width:
          current.append(word)
      else:
          lines.append(" ".join(current))
          current = [word]

    if current:
        lines.append(" ".join(current))

    x, y = position
    for line in lines:
        draw.text((x, y), line, font=font, fill=fill)
        bbox = draw.textbbox((x, y), line, font=font)
        y = bbox[3] + line_gap

    return y


def make_panel(path: Path, size: tuple[int, int]) -> Image.Image:
    image = Image.open(path).convert("RGB")
    image = cover_crop(image, *size)
    image = ImageEnhance.Contrast(image).enhance(1.08)
    image = ImageEnhance.Color(image).enhance(1.04)
    return image


def generate_banner(output_name: str, image_names: list[str], title: str, subtitle: str) -> None:
    width, height = 1600, 900
    canvas = Image.new("RGB", (width, height), (10, 8, 9))
    draw = ImageDraw.Draw(canvas)

    left_width = 640
    slot_height = height // len(image_names)

    for index, image_name in enumerate(image_names):
        panel = make_panel(ASSETS / image_name, (left_width, slot_height + 4))
        canvas.paste(panel, (0, index * slot_height))

    left_overlay = Image.new("RGBA", (left_width, height), (0, 0, 0, 74))
    canvas.paste(left_overlay, (0, 0), left_overlay)

    right = Image.new("RGBA", (width - left_width + 120, height), (15, 10, 12, 0))
    right_draw = ImageDraw.Draw(right)
    for x in range(right.width):
        mix = x / max(1, right.width - 1)
        alpha = int(224 - (mix * 96))
        color = (
            int(227 * (1 - mix) + 36 * mix),
            int(18 * (1 - mix) + 9 * mix),
            int(18 * (1 - mix) + 12 * mix),
            alpha,
        )
        right_draw.line((x, 0, x, height), fill=color)
    canvas.paste(right, (left_width - 120, 0), right)

    blur = canvas.filter(ImageFilter.GaussianBlur(radius=1.4))
    canvas = Image.blend(canvas, blur, 0.14)
    draw = ImageDraw.Draw(canvas)

    logo = Image.open(ASSETS / "logo.jpeg").convert("RGBA")
    logo = logo.resize((170, 170), Image.Resampling.LANCZOS)
    canvas.paste(logo, (760, 86), logo)

    draw.text((760, 285), "CITYPLUG RECORDS", font=LABEL_FONT, fill=(255, 70, 70))
    next_y = draw_multiline(
        draw,
        title,
        (760, 325),
        TITLE_FONT,
        (248, 246, 244),
        700,
        line_gap=8,
    )
    draw_multiline(
        draw,
        subtitle,
        (760, next_y + 18),
        SUBTITLE_FONT,
        (225, 225, 225),
        660,
        line_gap=7,
    )

    draw.rectangle((40, 40, width - 40, height - 40), outline=(255, 63, 63), width=3)

    canvas.save(ASSETS / output_name, quality=92)


if __name__ == "__main__":
    generate_banner(
        output_name="who-we-are.jpg",
        image_names=["Djopdot.jpg", "Pearl.jpg", "Tekunbi.jpg"],
        title="A collective shaping sound, style, and culture from Lagos to the world.",
        subtitle="Cityplug backs artists with presence, originality, and a sharp visual identity.",
    )
    generate_banner(
        output_name="our-story.jpg",
        image_names=["Wandey.jpg", "Sheay.jpg", "Bella.jpg"],
        title="The Cityplug story is built on artist energy, ambition, and a street-rooted point of view.",
        subtitle="From discovery to spotlight, the movement keeps expanding with bold new voices.",
    )
