import json
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from dotenv import load_dotenv
import os
# --- NEW: Import the LSTM predictor instead of the old classifier ---
from lstm_predictor import predict_intent

load_dotenv()

app = Flask(__name__)
CORS(app)  # Enable Cross-Origin Resource Sharing

# --- Load the Support Agent Model ---
try:
    with open('support_agent_model.json', 'r') as f:
        support_model = json.load(f)
    print("✅ [Flask App] Support agent model loaded successfully.")
except Exception as e:
    print(f"❌ FATAL: Could not load support_agent_model.json. {e}")
    support_model = {"intents": []}


@app.route('/api/chat', methods=['POST'])
def handle_chat():
    data = request.get_json()
    message = data.get('message')

    if not message:
        return jsonify({'error': 'Message is required.'}), 400

    try:
        # --- Step 1: Intent Recognition using the new LSTM model ---
        predicted_intent_name = predict_intent(message)
        
        matched_intent = next((i for i in support_model['intents'] if i['name'] == predicted_intent_name), None)

        if not matched_intent:
            # Fallback for unrecognized intents
            matched_intent = next((i for i in support_model['intents'] if i['name'] == 'GeneralQuestion'), None)
            if not matched_intent:
                 return jsonify({'reply': "I'm sorry, I'm not sure how to help with that."})


        # --- Step 2: Formulate the Final Response using an LLM ---
        final_prompt = matched_intent['responseStrategy']['prompt'].replace('[user_message]', message)
        
        # Call the external LLM for the final text generation
        llm_response = call_gemini(final_prompt)

        return jsonify({'reply': llm_response})

    except Exception as e:
        print(f"❌ Error in chat handler: {e}")
        return jsonify({'error': "An error occurred while processing your request."}), 500

def call_gemini(prompt):
    """Helper function to call the Google Gemini API."""
    api_key = os.getenv('GOOGLE_API_KEY')
    if not api_key:
        return "Error: GOOGLE_API_KEY is not configured."
        
    api_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key={api_key}"
    
    headers = {'Content-Type': 'application/json'}
    payload = {'contents': [{'parts': [{'text': prompt}]}]}
    
    try:
        response = requests.post(api_url, headers=headers, json=payload)
        response.raise_for_status()
        data = response.json()
        return data['candidates'][0]['content']['parts'][0]['text']
    except Exception as e:
        print(f"❌ Gemini API Error: {e}")
        return "Sorry, I'm having trouble connecting to my AI brain right now."

if __name__ == '__main__':
    # Use the PORT from .env, defaulting to 3002
    app.run(port=int(os.getenv("PORT", 3002)), debug=False)

