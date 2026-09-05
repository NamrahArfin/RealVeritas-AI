import os
import sys

# Ensure backend directory is in the path
base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(base_dir)

from services.audio_verifier import AudioVerifier

def test_model():
    print("Loading Audio Verifier & AI Model...")
    verifier = AudioVerifier()
    
    # TODO: Replace with an actual path to a .wav or .mp3 file on your system
    test_audio_file = r"D:\test_audio_data\sample_audio.wav"
    
    print(f"\nAnalyzing test audio: {test_audio_file}")
    
    try:
        result = verifier.verify_audio(test_audio_file)
        print("\n" + "="*40)
        print("           VERIFICATION RESULT")
        print("="*40)
        print(f"Classification : {result.get('classification')}")
        print(f"Authenticity Score : {result.get('score')}/100")
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
