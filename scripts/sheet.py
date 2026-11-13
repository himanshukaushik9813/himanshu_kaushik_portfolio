import sys, glob
from PIL import Image
pat, outp = sys.argv[1], sys.argv[2]
cols = int(sys.argv[3]) if len(sys.argv) > 3 else 6
fs = sorted(glob.glob(pat))
w0, h0 = Image.open(fs[0]).size
cw = 400; ch = int(h0 * cw / w0)
rows = (len(fs) + cols - 1) // cols
sheet = Image.new('RGB', (cols * cw, rows * ch), 'white')
for i, f in enumerate(fs):
    sheet.paste(Image.open(f).convert('RGB').resize((cw, ch)), ((i % cols) * cw, (i // cols) * ch))
sheet.save(outp)
print(len(fs), sheet.size)
