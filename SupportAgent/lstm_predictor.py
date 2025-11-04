import json
import re
import numpy as np
import tensorflow as tf
from tensorflow.keras.preprocessing.text import tokenizer_from_json
from tensorflow.keras.preprocessing.sequence import pad_sequences

# --- Load the trained model and artifacts ---
print("🧠 [Predictor] Loading trained LSTM model and artifacts...")

# Load the main neural network model
model = tf.keras.models.load_model('intent_classifier_model.h5')

# Load the tokenizer configuration
with open('tokenizer.json', 'r') as f:
    tokenizer_data = json.load(f)
    tokenizer = tokenizer_from_json(tokenizer_data)

# Load the list of intent names
with open('label_encoder.json', 'r') as f:
    label_classes = json.load(f)

# --- FIX ---
# In modern TensorFlow/Keras, the input length is retrieved from the model's 
# overall input_shape, not the individual layer's. The shape is 
# (batch_size, sequence_length), so we get the second element [1].
MAX_SEQUENCE_LENGTH = model.input_shape[1]

print("✅ [Predictor] Model and artifacts loaded successfully.")

def predict_intent(text):
    """
    Predicts the intent of a given text string using the loaded LSTM model.
    """
    # 1. Pre-process the input text in the exact same way as the training data
    cleaned_text = re.sub(r'[^\w\s]', '', text.lower())
    
    # 2. Tokenize and pad the sequence to the required length
    sequence = tokenizer.texts_to_sequences([cleaned_text])
    padded_sequence = pad_sequences(sequence, maxlen=MAX_SEQUENCE_LENGTH, padding='post', truncating='post')
    
    # 3. Use the trained model to make a prediction
    prediction = model.predict(padded_sequence)
    
    # 4. Decode the prediction to find the most likely intent
    predicted_class_index = np.argmax(prediction, axis=1)[0]
    predicted_intent = label_classes[predicted_class_index]
    
    confidence = prediction[0][predicted_class_index]

    print(f"🔍 [Predictor] Intent: '{predicted_intent}' with confidence: {confidence:.2f}")

    # 5. (Optional) Add a confidence threshold to handle uncertainty
    if confidence < 0.5: # If the model is less than 50% sure...
        print("⚠️ [Predictor] Confidence is low. Falling back to a default intent.")
        return "GeneralQuestion" # ...fall back to a safe default.

    return predicted_intent

