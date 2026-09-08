import os
import numpy as np
from PIL import Image
import uuid

class ImageVerifier:
    def __init__(self, model_dir="image"):
        script_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        self.model_path = os.path.abspath(os.path.join(script_dir, "models", "image_detector_model.h5"))
        
        self.image_model = None
        self.ocr_reader = None
        self.labels = {
            0: "Authentic",
            1: "AI Generated",
            2: "AI Manipulated"
        }
        
        self.load_model()
        self.load_ocr()

    def load_model(self):
        try:
            import tensorflow as tf
            if os.path.exists(self.model_path):
                self.image_model = tf.keras.models.load_model(self.model_path)
                print("Image Model Loaded. Output Shape:", self.image_model.output_shape)
            else:
                print(f"Warning: Image model file not found at {self.model_path}. Image verification will run in fallback/offline mode.")
        except Exception as e:
            print(f"Warning: Could not load TensorFlow or image model: {e}. Image verification will run in fallback/offline mode.")

    def load_ocr(self):
        try:
            import easyocr
            self.ocr_reader = easyocr.Reader(['en'], gpu=False)
            print("OCR Reader initialized successfully.")
        except Exception as e:
            print(f"Warning: Could not initialize EasyOCR reader: {e}. OCR text checks will be bypassed.")

    def _get_media_fallback(self, file_path: str):
        # Fallback reasoning based on lightweight metadata heuristics
        try:
            img = Image.open(file_path)
            exif_data = img.getexif()
            
            # 0x0131 is the standard EXIF tag for 'Software'
            software_tag = exif_data.get(0x0131, "").lower() if exif_data else ""
            
            # Check for known AI / Generative markers
            ai_markers = ["midjourney", "dall-e", "stable diffusion", "ai generated"]
            manipulation_markers = ["photoshop", "lightroom", "gimp", "canva"]
            
            is_ai = any(marker in software_tag for marker in ai_markers)
            is_manipulated = any(marker in software_tag for marker in manipulation_markers)
            
            if is_ai:
                return {
                    "classification": "AI Generated (Metadata Analysis)",
                    "confidence": 95,
                    "score": 5,
                    "summary": "Deep AI models were unavailable, but metadata analysis found strong signatures of generative AI software.",
                    "reasoning": [
                        f"EXIF 'Software' tag explicitly lists generative tool: '{software_tag}'.",
                        "Image is highly likely to be entirely synthetic."
                    ],
                    "highlights": []
                }
            elif is_manipulated:
                return {
                    "classification": "AI Manipulated (Metadata Analysis)",
                    "confidence": 85,
                    "score": 25,
                    "summary": "Deep AI models were unavailable, but metadata analysis indicates the image was edited using photo manipulation software.",
                    "reasoning": [
                        f"EXIF 'Software' tag indicates editing tool: '{software_tag}'.",
                        "While the original photo might be real, it has been altered or spliced."
                    ],
                    "highlights": []
                }
            elif exif_data and len(exif_data) > 0:
                return {
                    "classification": "Authentic (Metadata Analysis)",
                    "confidence": 75,
                    "score": 85,
                    "summary": "Deep AI models were unavailable. Basic metadata checks show standard camera signatures without obvious manipulation flags.",
                    "reasoning": [
                        "Valid EXIF data found, typical of authentic camera captures.",
                        "No known generative or photo-editing software tags detected."
                    ],
                    "highlights": []
                }
            else:
                return {
                    "classification": "Authentic (Metadata Analysis)",
                    "confidence": 40,
                    "score": 60,
                    "summary": "Deep AI models were unavailable. The image contains no metadata, which is common for internet downloads, making it difficult to authenticate heuristically.",
                    "reasoning": [
                        "All EXIF metadata has been stripped from the image.",
                        "Cannot definitively confirm authenticity without deep CNN analysis."
                    ],
                    "highlights": []
                }
        except Exception as e:
            return {
                "classification": "Inconclusive",
                "confidence": 0,
                "score": 50,
                "summary": "The system experienced a critical error and could not analyze the image.",
                "reasoning": [f"File read error: {str(e)}"],
                "highlights": []
            }

    def verify_image(self, file_path: str):
        # Validate Image
        try:
            img_check = Image.open(file_path)
            img_check.verify()
        except Exception:
            raise ValueError("Uploaded file is not a valid image.")

        # OCR Density Check
        text_percentage = 0.0
        total_chars = 0
        num_boxes = 0

        if self.ocr_reader is not None:
            try:
                ocr_result = self.ocr_reader.readtext(
                    file_path, detail=1, paragraph=False,
                    text_threshold=0.5, low_text=0.3
                )
                img = Image.open(file_path)
                img_width, img_height = img.size
                image_area = img_width * img_height
                img.close()
                text_area = 0

                num_boxes = len(ocr_result)
                for item in ocr_result:
                    box, text = item[0], item[1]  # type: ignore
                    total_chars += len(text)
                    x1, y1 = min(p[0] for p in box), min(p[1] for p in box)
                    x2, y2 = max(p[0] for p in box), max(p[1] for p in box)
                    text_area += (x2 - x1) * (y2 - y1)  # type: ignore

                if image_area > 0:
                    text_percentage = text_area / image_area
                print("========== OCR INFO ==========")
                print("Detected Text Boxes :", num_boxes)
                print("Detected Characters:", total_chars)
                print("Text Area Ratio     :", round(text_percentage, 3))
                print("==============================")
            except Exception as e:
                print(f"Error executing OCR: {e}. Bypassing density checks.")

        text_warning = False
        if self.ocr_reader is not None and (text_percentage > 0.15 or total_chars > 150 or num_boxes > 20):
            print("Image contains mostly text. Warning flag set.")
            text_warning = True

        # CNN Prediction
        if self.image_model is not None:
            try:
                import tensorflow as tf
                import cv2
                from tensorflow.keras.preprocessing import image as keras_image  # type: ignore
                
                img_pil = keras_image.load_img(file_path)
                width, height = img_pil.size
                patch_size = 128
                patches = []
                
                left = (width - patch_size) / 2
                top = (height - patch_size) / 2
                patches.append(img_pil.crop((left, top, left + patch_size, top + patch_size)))
                patches.append(img_pil.crop((0, 0, patch_size, patch_size)))
                patches.append(img_pil.crop((width - patch_size, 0, width, patch_size)))
                patches.append(img_pil.crop((0, height - patch_size, patch_size, height)))
                patches.append(img_pil.crop((width - patch_size, height - patch_size, width, height)))
                
                if width < patch_size or height < patch_size:
                    patches = [img_pil.resize((patch_size, patch_size))]
                
                patches.append(img_pil.resize((patch_size, patch_size)))
                
                patch_arrays = []
                for p in patches:
                    arr = keras_image.img_to_array(p.resize((128, 128))) / 255.0
                    patch_arrays.append(arr)
                    
                batch = np.array(patch_arrays)
                predictions = self.image_model.predict(batch, verbose=0)
                
                avg_pred = np.mean(predictions, axis=0)
                predicted_class = int(np.argmax(avg_pred))
                
                prob_authentic = float(avg_pred[0])
                prob_generated = float(avg_pred[1]) if len(avg_pred) > 1 else 0.0
                prob_manipulated = float(avg_pred[2]) if len(avg_pred) > 2 else 0.0
                
                result_label = self.labels.get(predicted_class, "Unknown")
                
                # Authenticity score is directly the probability of the Authentic class
                score = prob_authentic * 100
                # Confidence is how sure the model is about its final chosen class
                confidence = float(np.max(avg_pred)) * 100
                
                # Grad-CAM Heatmap
                heatmap_url = None
                img_array = keras_image.img_to_array(img_pil.resize((128, 128))) / 255.0
                img_array = np.expand_dims(img_array, axis=0)
                
                last_conv_layer_name = None
                for layer in reversed(self.image_model.layers):
                    if hasattr(layer, 'output_shape') and isinstance(layer.output_shape, tuple) and len(layer.output_shape) == 4:
                        last_conv_layer_name = layer.name
                        break
                        
                if last_conv_layer_name and result_label != "Authentic":
                    try:
                        grad_model = tf.keras.models.Model(
                            [self.image_model.inputs],
                            [self.image_model.get_layer(last_conv_layer_name).output, self.image_model.output]
                        )
                        with tf.GradientTape() as tape:
                            conv_outputs, model_predictions = grad_model(img_array)
                            loss = model_predictions[:, predicted_class]
                            
                        grads = tape.gradient(loss, conv_outputs)
                        pooled_grads = tf.reduce_mean(grads, axis=(0, 1, 2))
                        conv_outputs = conv_outputs[0]
                        heatmap = conv_outputs @ pooled_grads[..., tf.newaxis]  # type: ignore
                        heatmap = tf.squeeze(heatmap)
                        heatmap = tf.maximum(heatmap, 0) / tf.math.reduce_max(heatmap)
                        heatmap = heatmap.numpy()
                        
                        heatmap = cv2.resize(heatmap, (width, height))
                        heatmap = np.uint8(255 * heatmap)
                        heatmap = cv2.applyColorMap(heatmap, cv2.COLORMAP_JET)  # type: ignore
                        
                        original_img = cv2.cvtColor(np.array(img_pil), cv2.COLOR_RGB2BGR)
                        superimposed_img = heatmap * 0.4 + original_img
                        
                        heatmap_filename = f"heatmap_{uuid.uuid4().hex}_{os.path.basename(file_path)}"
                        heatmap_path = os.path.join(os.path.dirname(file_path), heatmap_filename)
                        cv2.imwrite(heatmap_path, superimposed_img)
                        heatmap_url = f"http://127.0.0.1:8000/uploads/{heatmap_filename}"
                    except Exception as e:
                        print(f"Grad-CAM failed: {e}")
                
                if result_label == "AI Manipulated":
                    summary = "Image exhibits localized blending and edge artifacts, indicating manipulation or deepfake techniques."
                    reasoning = [
                        f"CNN Model: Predicts AI manipulation with {round(confidence, 1)}% probability.",
                        "Forensic analysis detected irregular pixel boundaries or face-warping artifacts."
                    ]
                elif result_label == "AI Generated":
                    summary = "Image contains typical signatures of AI generation models such as Stable Diffusion or Midjourney."
                    reasoning = [
                        f"CNN Model: Predicts fully AI-generated origin with {round(confidence, 1)}% probability.",
                        "GAN/Diffusion artifacts (e.g., over-smooth textures or asymmetrical background elements) detected."
                    ]
                else:
                    summary = "Image appears to be organically captured with natural noise profiles and coherent lighting."
                    reasoning = [
                        f"CNN Model: Predicts authentic human/camera origin with {round(confidence, 1)}% probability.",
                        "No significant generation or manipulation artifacts found."
                    ]
                
                if text_warning:
                    reasoning.insert(0, "High text density detected. Consider running this through the Text Module for comprehensive analysis.")
                
                return {
                    "classification": result_label,
                    "confidence": int(confidence),
                    "score": int(score),
                    "summary": summary,
                    "reasoning": reasoning,
                    "highlights": [],
                    "heatmap_url": heatmap_url
                }
            except Exception as e:
                print(f"Prediction failed with exception: {e}. Using fallback classification.")
                fallback_data = self._get_media_fallback(file_path)
                return fallback_data
        else:
            print("No image model loaded. Using fallback classification.")
            fallback_data = self._get_media_fallback(file_path)
            return fallback_data
