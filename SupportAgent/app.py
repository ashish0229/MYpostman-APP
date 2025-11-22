import json
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from dotenv import load_dotenv
import os
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
        llm_response = call_llama(final_prompt)

        return jsonify({'reply': llm_response})

    except Exception as e:
        print(f"❌ Error in chat handler: {e}")
        return jsonify({'error': "An error occurred while processing your request."}), 500

def call_llama(prompt):
    """Call free Llama 3.1 model using Groq API."""
    try:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            return "Error: GROQ_API_KEY is not configured."

        url = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": "llama-3.3-70b-versatile",
            "messages": [
                {"role": "system", "content": "You are a helpful support agent for MYpostmate."},
                {"role": "user", "content": prompt}
            ],
            "max_tokens": 200,
            "temperature": 0.7
        }

        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()

        data = response.json()
        return data["choices"][0]["message"]["content"]

    except Exception as e:
        print("❌ Groq API Error:", e)
        return "Sorry, I'm having trouble connecting to the AI system right now."


if __name__ == '__main__':
    app.run(port=3002, debug=False)
# To run with Uvicorn for ASGI support
# uvicorn.run(app, host='0.0.0.0', port=3002)


