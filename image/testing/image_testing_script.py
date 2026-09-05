import sys
import os

# Ensure the services folder is in the python path
sys.path.append(os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "services"))

from image_verifier import ImageVerifier

def test_model():
    print("Loading Image Verifier & AI Model...")
    verifier = ImageVerifier()
    
    test_img = r"D:\test_data_v2\0016e1d72d404fe68074cc87cb30aa37.jpg"
    print(f"\nAnalyzing test image: {test_img}")
    
    try:
        result = verifier.verify_image(test_img)
        print("\n" + "="*40)
        print("           VERIFICATION RESULT")
        print("="*40)
        print(f"Classification : {result.get('classification')}")
        print(f"Confidence     : {result.get('confidence')}%")
        print(f"Summary        : {result.get('summary')}")
        print("Reasoning      :")
        for r in result.get('reasoning', []):
            print(f"   - {r}")
        print("="*40)
    except Exception as e:
        print(f"Error during verification: {e}")

if __name__ == "__main__":
    test_model()
