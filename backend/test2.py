import sys
sys.path.insert(0, r'n:\RealVeritas AI')
from text.services.text_verifier import TextVerifier
tv = TextVerifier()
with open(r'n:\RealVeritas AI\test_media\text_human_authentic.txt', 'r', encoding='utf-8') as f:
    text = f.read()
    res = tv.verify_text(text)
    print("Class:", res['classification'], "Conf:", res['confidence'])
