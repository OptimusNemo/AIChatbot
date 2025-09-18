
from flask import Flask, request, jsonify
import requests

app = Flask(__name__)


@app.route('/query', methods=['POST'])
def query_llama():
    user_prompt = request.json.get("prompt", "")
    
    headers = {
        
        "Content-Type": "application/json"
    }
    
    payload = {
        "messages": [{"role": "user", "content": user_prompt}],
        "temperature": 0.7
    }

    try:
        response = requests.post(LLAMA_API_URL, headers=headers, json=payload)
        response.raise_for_status()
        reply = response.json()["choices"][0]["message"]["content"]
        return jsonify({"reply": reply})
    except Exception as e:
        return jsonify({"reply": f"Error: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(port=5000)
