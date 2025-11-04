import json
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

class IntentClassifier:
    """
    A simple NLP model to classify user intent based on training phrases.
    Uses TF-IDF to vectorize text and cosine similarity to find the best match.
    """
    def __init__(self, model_path='support_agent_model.json'):
        """
        Initializes the classifier by loading the model and training the vectorizer.
        """
        print("🤖 [ML Agent] Initializing Intent Classifier...")
        try:
            with open(model_path, 'r') as f:
                self.model = json.load(f)
            
            self.intents = {intent['name']: intent for intent in self.model['intents']}
            self.training_phrases = []
            self.intent_map = []

            for intent_name, intent_data in self.intents.items():
                for phrase in intent_data['trainingPhrases']:
                    self.training_phrases.append(phrase)
                    self.intent_map.append(intent_name)
            
            # Initialize and fit the TF-IDF Vectorizer
            self.vectorizer = TfidfVectorizer()
            self.training_vectors = self.vectorizer.fit_transform(self.training_phrases)
            print("✅ [ML Agent] Intent Classifier ready.")

        except FileNotFoundError:
            print(f"❌ FATAL: Could not find the model file at {model_path}")
            self.model = None
        except Exception as e:
            print(f"❌ FATAL: Error initializing Intent Classifier: {e}")
            self.model = None


    def classify(self, user_message, confidence_threshold=0.2):
        """
        Classifies the user's message to find the best matching intent.
        
        Args:
            user_message (str): The input text from the user.
            confidence_threshold (float): The minimum similarity score to be considered a match.

        Returns:
            dict: The matched intent data from the JSON model, or None if no match is found.
        """
        if not self.model:
            return None

        # Vectorize the user's message
        message_vector = self.vectorizer.transform([user_message])

        # Calculate cosine similarity against all training phrases
        similarities = cosine_similarity(message_vector, self.training_vectors)

        # Find the best match
        best_match_index = np.argmax(similarities)
        best_match_score = similarities[0, best_match_index]

        print(f"🧠 [ML Agent] Intent analysis: Best match score is {best_match_score:.2f}")

        if best_match_score >= confidence_threshold:
            matched_intent_name = self.intent_map[best_match_index]
            print(f"🎯 [ML Agent] Classified intent as: {matched_intent_name}")
            return self.intents.get(matched_intent_name)
        else:
            print("🤔 [ML Agent] Intent not recognized with sufficient confidence.")
            return None

# Create a single instance of the classifier to be used by the Flask app
classifier = IntentClassifier()
