import os
import sys

# Ensure backend directory is in the path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.text_verifier import TextVerifier

def run_tests():
    print("Initializing TextVerifier test...")
    verifier = TextVerifier()
    
    # Test human-like text
    human_text = "I went to the local store today. I bought some fresh apples and oranges. The weather was very nice, so I walked back home."
    print("\nTesting Human Text...")
    print(f"Input: {human_text}")
    res1 = verifier.verify_text(human_text)
    print(f"Classification: {res1['classification']}")
    print(f"Authenticity Score: {res1['score']}/100")
    print(f"Confidence: {res1['confidence']}%")
    print(f"Summary: {res1['summary']}")
    print(f"Reasoning: {res1['reasoning']}")
    print(f"Highlights: {res1['highlights']}")
    
    # Test AI-like text
    ai_text = "Furthermore, it is important to consider the dynamic properties of renewable networks. In conclusion, the integration of smart grids represents a key technical lever."
    print("\nTesting AI-Generated Text...")
    print(f"Input: {ai_text}")
    res2 = verifier.verify_text(ai_text)
    print(f"Classification: {res2['classification']}")
    print(f"Authenticity Score: {res2['score']}/100")
    print(f"Confidence: {res2['confidence']}%")
    print(f"Summary: {res2['summary']}")
    print(f"Reasoning: {res2['reasoning']}")
    print(f"Highlights: {res2['highlights']}")
    
    # Test AI-assisted text
    assisted_text = "Although the initial draft was written by me, I decided to polish the syntax and flow with an automated grammar assistant to make it sound more formal."
    print("\nTesting AI-Assisted Text...")
    print(f"Input: {assisted_text}")
    res3 = verifier.verify_text(assisted_text)
    print(f"Classification: {res3['classification']}")
    print(f"Authenticity Score: {res3['score']}/100")
    print(f"Confidence: {res3['confidence']}%")
    print(f"Summary: {res3['summary']}")
    print(f"Reasoning: {res3['reasoning']}")
    print(f"Highlights: {res3['highlights']}")
    
    # Assert return fields
    assert "classification" in res1
    assert "score" in res1
    assert "confidence" in res1
    assert "summary" in res1
    assert "reasoning" in res1
    assert "highlights" in res1
    assert "classification" in res3
    
    print("\nAll TextVerifier basic interface checks passed!")

if __name__ == "__main__":
    run_tests()
