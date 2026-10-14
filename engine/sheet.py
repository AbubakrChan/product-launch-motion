# sheet.py <dir> <out.jpg> [cols=6] [tile_w=384]: contact sheet of every PNG/JPG in dir, labelled with its time.
import sys, os
from PIL import Image, ImageDraw
d, out = sys.argv[1], sys.argv[2]
cols = int(sys.argv[3]) if len(sys.argv) > 3 else 6
tw = int(sys.argv[4]) if len(sys.argv) > 4 else 384
fs = sorted(f for f in os.listdir(d) if f.lower().endswith(('.png', '.jpg')))
th = tw * 9 // 16; rows = (len(fs) + cols - 1) // cols
S = Image.new('RGB', (cols * tw, rows * th), 'white'); D = ImageDraw.Draw(S)
for i, f in enumerate(fs):
    im = Image.open(os.path.join(d, f)).convert('RGB').resize((tw, th), Image.LANCZOS)
    x, y = (i % cols) * tw, (i // cols) * th; S.paste(im, (x, y))
    label = f.rsplit('.', 1)[0].lstrip('t').lstrip('0') or '0'
    D.rectangle([x, y, x + 64, y + 18], fill=(20, 20, 20)); D.text((x + 4, y + 3), label, fill='white')
    D.rectangle([x, y, x + tw - 1, y + th - 1], outline=(200, 200, 200))
S.save(out, quality=85)
print(out, len(fs), 'tiles')
