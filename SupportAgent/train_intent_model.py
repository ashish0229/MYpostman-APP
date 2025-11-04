import json
import numpy as np
import tensorflow as tf
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, Embedding, LSTM, Dropout
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import LabelEncoder
from sklearn.metrics import confusion_matrix, ConfusionMatrixDisplay
import matplotlib.pyplot as plt
import re

# --- 1. Data Loading and Pre-processing ---

def load_and_preprocess_data(json_path='support_agent_model.json'):
    """
    Loads training phrases from the JSON model, cleans them, and prepares them for the neural network.
    """
    print("🧠 [Data Prep] Loading and pre-processing data...")
    with open(json_path, 'r') as f:
        data = json.load(f)

    phrases = []
    intents = []

    # Extract training phrases and their corresponding intent names
    for intent in data['intents']:
        for phrase in intent['trainingPhrases']:
            # Basic text cleaning: lowercase and remove special characters
            cleaned_phrase = re.sub(r'[^\w\s]', '', phrase.lower())
            phrases.append(cleaned_phrase)
            intents.append(intent['name'])
            
    print(f"✅ [Data Prep] Found {len(phrases)} training phrases for {len(data['intents'])} intents.")
    return phrases, intents

# --- 2. Tokenization and Standardization ---

def tokenize_and_standardize(phrases, intents):
    """
    Converts text data into numerical sequences that the model can understand.
    """
    print("\n🔢 [Tokenization] Converting text to numerical sequences...")
    
    # Create a tokenizer to map words to integers
    tokenizer = Tokenizer(num_words=5000, oov_token="<OOV>")
    tokenizer.fit_on_texts(phrases)
    
    # Convert phrases to sequences of integers
    sequences = tokenizer.texts_to_sequences(phrases)
    
    # Pad sequences to ensure they are all the same length
    padded_sequences = pad_sequences(sequences, padding='post', truncating='post')
    
    # Encode the intent labels (e.g., 'LoginIssue') into integers (e.g., 0, 1, 2)
    label_encoder = LabelEncoder()
    encoded_labels = label_encoder.fit_transform(intents)
    
    # Convert labels to one-hot encoding for the neural network
    one_hot_labels = tf.keras.utils.to_categorical(encoded_labels)
    
    print("✅ [Tokenization] Data is now standardized and ready for the model.")
    return padded_sequences, one_hot_labels, tokenizer, label_encoder

# --- 3. Build the RNN (LSTM) Model ---

def build_lstm_model(input_length, num_classes, tokenizer):
    """
    Defines the architecture of the Recurrent Neural Network.
    """
    print("\n🏗️ [Model Build] Building the LSTM model architecture...")
    
    model = Sequential([
        # Embedding layer: Converts integer sequences into dense vectors of a fixed size.
        Embedding(input_dim=len(tokenizer.word_index) + 1, output_dim=64, input_length=input_length),
        
        # LSTM layer: The core of the RNN, captures sequential information.
        LSTM(64, return_sequences=True),
        Dropout(0.5), # Dropout helps prevent overfitting
        LSTM(32),
        Dropout(0.5),

        # Dense layers: Standard fully connected neural network layers for classification.
        Dense(32, activation='relu'),
        Dense(num_classes, activation='softmax') # Softmax for multi-class classification
    ])
    
    model.compile(loss='categorical_crossentropy', optimizer='adam', metrics=['accuracy'])
    
    print("✅ [Model Build] Model compiled successfully.")
    model.summary()
    return model

# --- 4. Train and Evaluate the Model ---

def train_and_evaluate(model, X_train, y_train, X_test, y_test, label_encoder):
    """
    Trains the model and visualizes its performance.
    """
    print("\n🏋️ [Training] Starting model training...")
    
    history = model.fit(X_train, y_train, epochs=50, validation_data=(X_test, y_test), verbose=2)
    
    print("✅ [Training] Training complete.")

    # --- 5. Plot Graphs to Understand Model Performance ---
    print("\n📈 [Evaluation] Plotting accuracy and loss graphs...")
    
    # Plot training & validation accuracy values
    plt.figure(figsize=(12, 5))
    plt.subplot(1, 2, 1)
    plt.plot(history.history['accuracy'])
    plt.plot(history.history['val_accuracy'])
    plt.title('Model Accuracy')
    plt.ylabel('Accuracy')
    plt.xlabel('Epoch')
    plt.legend(['Train', 'Test'], loc='upper left')

    # Plot training & validation loss values
    plt.subplot(1, 2, 2)
    plt.plot(history.history['loss'])
    plt.plot(history.history['val_loss'])
    plt.title('Model Loss')
    plt.ylabel('Loss')
    plt.xlabel('Epoch')
    plt.legend(['Train', 'Test'], loc='upper left')
    
    plt.savefig('model_performance.png')
    print("✅ [Evaluation] Performance graphs saved to 'model_performance.png'.")

    # --- 6. Generate and Plot Confusion Matrix ---
    print("\n📈 [Evaluation] Generating confusion matrix...")
    
    predictions = model.predict(X_test)
    predicted_labels = np.argmax(predictions, axis=1)
    actual_labels = np.argmax(y_test, axis=1)
    
    all_labels = label_encoder.classes_

    cm = confusion_matrix(actual_labels, predicted_labels)
    display = ConfusionMatrixDisplay(confusion_matrix=cm, display_labels=all_labels)
    
    fig, ax = plt.subplots(figsize=(10, 10))
    display.plot(ax=ax, xticks_rotation='vertical', cmap='Blues')
    ax.set_title("Intent Classification Confusion Matrix")
    plt.tight_layout()
    
    plt.savefig('confusion_matrix.png')
    print("✅ [Evaluation] Confusion matrix saved to 'confusion_matrix.png'.")

def save_model_and_artifacts(model, tokenizer, label_encoder):
    """
    Saves the trained model and the necessary pre-processing objects.
    """
    print("\n💾 [Save] Saving trained model and artifacts...")
    
    # Save the TensorFlow/Keras model
    model.save('intent_classifier_model.h5')
    
    # Save the tokenizer and label encoder
    with open('tokenizer.json', 'w') as f:
        f.write(json.dumps(tokenizer.to_json(), indent=4))
        
    with open('label_encoder.json', 'w') as f:
        f.write(json.dumps(list(label_encoder.classes_), indent=4))
        
    print("✅ [Save] Model and artifacts saved successfully.")


if __name__ == '__main__':
    # Full ML Pipeline
    phrases, intents = load_and_preprocess_data()
    padded_sequences, one_hot_labels, tokenizer, label_encoder = tokenize_and_standardize(phrases, intents)

    # Split data for training and testing
    X_train, X_test, y_train, y_test = train_test_split(padded_sequences, one_hot_labels, test_size=0.2, random_state=42)
    
    model = build_lstm_model(X_train.shape[1], y_train.shape[1], tokenizer)
    
    train_and_evaluate(model, X_train, y_train, X_test, y_test, label_encoder)
    
    save_model_and_artifacts(model, tokenizer, label_encoder)
    
    print("\n🎉 [Complete] Full training and evaluation pipeline has finished.")
