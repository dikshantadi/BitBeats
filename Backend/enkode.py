#converting text into utf-8 binary format

def text_to_bitstream(txt: str) -> str:
    x = txt.encode("utf-8")

    bitstream = ''.join(format(byte, '08b') for byte in x)
    return bitstream
