import os
import sys

# Ensure backend and video service can be imported
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..')))
from video.services.video_verifier import VideoVerifier

def test_accuracy():
    verifier = VideoVerifier()
    
    test_media_dir = os.path.join(os.path.dirname(__file__), '..', '..', 'test_media')
    
    categories = ["Authentic", "AI_Generated", "Manipulated"]
    
    total_videos = 0
    correct_predictions = 0
    
    for category in categories:
        category_dir = os.path.join(test_media_dir, category)
        
        if not os.path.exists(category_dir):
            print(f"Skipping {category}: Folder not found.")
            continue
            
        videos = [f for f in os.listdir(category_dir) if f.lower().endswith(('.mp4', '.mov', '.mkv', '.avi', '.webm'))]
        
        if not videos:
            print(f"Skipping {category}: No videos found.")
            continue
            
        print(f"\n--- Testing Category: {category} ({len(videos)} videos) ---")
        
        for video_file in videos:
            video_path = os.path.join(category_dir, video_file)
            print(f"Processing: {video_file}...")
            
            result = verifier.verify_video(video_path)
            prediction = result.get('classification', 'Unknown')
            confidence = result.get('score', 0.0)
            
            # Map directory name to model output labels for accuracy check
            expected = "Authentic" if category == "Authentic" else ("AI-Generated" if category == "AI_Generated" else "Manipulated")
            
            is_correct = (prediction == expected)
            total_videos += 1
            if is_correct:
                correct_predictions += 1
                
            print(f"  -> Predicted: {prediction} ({confidence}%) | Expected: {expected} | Correct: {is_correct}")
            
    if total_videos > 0:
        accuracy = (correct_predictions / total_videos) * 100
        print(f"\n=====================================")
        print(f"FINAL ACCURACY: {accuracy:.2f}% ({correct_predictions}/{total_videos})")
        print(f"=====================================")
    else:
        print("\nNo videos were tested.")

if __name__ == "__main__":
    test_accuracy()
