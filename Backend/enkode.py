#converting text into utf-8 binary format

def take_message():
    txt = input ("Write message : ")
    x = txt.encode()

    bitstream = ''.join(format(byte, '08b') for byte in x)
    print(x)
    print(bitstream)
    return bitstream
