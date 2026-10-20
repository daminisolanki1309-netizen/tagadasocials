# Trim the empty white space below/right of a screenshot and shrink to max 1000px wide.
import sys
from PIL import Image, ImageChops
for p in sys.argv[1:]:
    im = Image.open(p).convert("RGB")
    bg = Image.new("RGB", im.size, (255, 255, 255))
    box = ImageChops.difference(im, bg).getbbox()
    if box:
        im = im.crop((0, 0, min(im.width, box[2] + 12), min(im.height, box[3] + 12)))
    if im.width > 1000:
        im = im.resize((1000, int(im.height * 1000 / im.width)))
    im.save(p, optimize=True)
