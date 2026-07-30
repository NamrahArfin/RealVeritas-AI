import os
import tensorflow as tf
from tensorflow.keras.preprocessing import image
import numpy as np

model_path = os.path.join(os.path.dirname(__file__), "image_detector_model.h5")
if not os.path.exists(model_path):
    model_path = "image_detector_model.h5"

model = tf.keras.models.load_model(model_path)

img_path = input("Enter image path: ")

img = image.load_img(img_path, target_size=(128, 128))
img_array = image.img_to_array(img)

img_array = img_array / 255.0
img_array = np.expand_dims(img_array, axis=0)

prediction = model.predict(img_array, verbose=0)
predicted_class = int(np.argmax(prediction))
confidence = round(float(np.max(prediction)) * 100, 2)

labels = {
    0: "Authentic",
    1: "AI Generated",
    2: "AI Manipulated"
}

result_label = labels.get(predicted_class, "Unknown")

print("\nPrediction Result:", result_label)
print("Confidence:", f"{confidence}%")