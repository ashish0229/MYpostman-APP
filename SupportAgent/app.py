import json
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
from dotenv import load_dotenv
import os
from pathlib import Path

import chromadb
from sentence_transformers import SentenceTransformer

from lstm_predictor import predict_intent

load_dotenv()

app = Flask(__name__)
CORS(app)

# --- Load the Support Agent Model ---
try:
    with open('support_agent_model.json', 'r') as f:
        support_model = json.load(f)
    print("✅ [Flask App] Support agent model loaded.")
except Exception as e:
    print(f"❌ FATAL: Could not load support_agent_model.json. {e}")
    support_model = {"intents": []}

# --- RAG setup (runs once at startup) ---
_rag_collection = None
_embedder       = None

try:
    _base    = Path(__file__).resolve().parent
    _vs_path = (_base / ".." / "Backend" / "RAG-local" / "notebook" / "vector_store").resolve()

    _embedder       = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
    _chroma         = chromadb.PersistentClient(path=str(_vs_path))
    _rag_collection = _chroma.get_collection("my_collection_v2")

    print(f"✅ [Flask App] RAG ready — {_rag_collection.count()} chunks loaded.")
except Exception as e:
    print(f"⚠️  [Flask App] RAG init failed — running without context. {e}")


def retrieve_context(message: str, n_results: int = 3) -> str:
    """Query ChromaDB and return a formatted context string."""
    if _rag_collection is None or _embedder is None:
        return ""

    query_vector = _embedder.encode(message).tolist()
    results      = _rag_collection.query(
        query_embeddings=[query_vector],
        n_results=n_results
    )

    docs = results.get("documents", [[]])[0]
    if not docs:
        return ""

    return "\n---\n".join(docs)


@app.route('/api/chat', methods=['POST'])
def handle_chat():
    data    = request.get_json()
    message = data.get('message')

    if not message:
        return jsonify({'error': 'Message is required.'}), 400

    try:
        # Step 1: Intent recognition (unchanged)
        predicted_intent_name = predict_intent(message)

        matched_intent = next(
            (i for i in support_model['intents'] if i['name'] == predicted_intent_name),
            None
        )

        if not matched_intent:
            matched_intent = next(
                (i for i in support_model['intents'] if i['name'] == 'GeneralQuestion'),
                None
            )
            if not matched_intent:
                return jsonify({'reply': "I'm sorry, I'm not sure how to help with that."})

        # Step 2: Retrieve RAG context
        rag_context = retrieve_context(message)

        # Step 3: Assemble final prompt
        base_prompt  = matched_intent['responseStrategy']['prompt'].replace('[user_message]', message)
        final_prompt = base_prompt

        if rag_context:
            final_prompt = (
                "Use the following documentation to inform your answer. "
                "Only use what is relevant.\n\n"
                f"### Context\n{rag_context}\n\n---\n\n"
                f"{base_prompt}"
            )

        # Step 4: Call Llama via Groq (unchanged)
        llm_response = call_llama(final_prompt)
        return jsonify({'reply': llm_response})

    except Exception as e:
        print(f"❌ Error in chat handler: {e}")
        return jsonify({'error': "An error occurred while processing your request."}), 500


def call_llama(prompt):
    """Call Llama 3.1 via Groq API. (unchanged)"""
    try:
        api_key = os.getenv("GROQ_API_KEY")
        if not api_key:
            return "Error: GROQ_API_KEY is not configured."

        url     = "https://api.groq.com/openai/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        payload = {
            "model": "llama-3.3-70b-versatile",
            "messages": [
                {"role": "system", "content": "You are a helpful support agent for MYpostmate."},
                {"role": "user",   "content": prompt}
            ],
            "max_tokens": 200,
            "temperature": 0.7
        }

        response = requests.post(url, headers=headers, json=payload)
        response.raise_for_status()
        return response.json()["choices"][0]["message"]["content"]

    except Exception as e:
        print("❌ Groq API Error:", e)
        return "Sorry, I'm having trouble connecting to the AI system right now."


if __name__ == '__main__':
    app.run(port=3002, debug=False)