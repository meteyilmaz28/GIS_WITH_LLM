from flask import Flask, render_template, request, send_from_directory
import google.generativeai as genai
import os
from dotenv import load_dotenv

app = Flask(__name__)

@app.route('/geo.json')
def serve_static():
    return send_from_directory('static', 'geo.json')

# Load environment variables
load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

if api_key:
    genai.configure(api_key=api_key)
else:
    raise ValueError("GEMINI_API_KEY environment variable not set")

# Create the model
generation_config = {
    "temperature": 1,
    "top_p": 0.95,
    "top_k": 64,
    "max_output_tokens": 8192,
    "response_mime_type": "text/plain",
}

model = genai.GenerativeModel(
    model_name="gemini-1.5-flash",
    generation_config=generation_config,
)

# Initialize chat history
chat_history = []

@app.route('/', methods=['GET', 'POST'])
def index():
    global chat_history
    user_input = None
    response = None
    if request.method == 'POST':
        user_input = request.form['prompt']
        
        # Update chat history with user input
        chat_history.append({"role": "user", "content": {"text": user_input}})
        
        # Start chat with updated history
        chat_session = model.start_chat(history=chat_history)
        response = chat_session.send_message(user_input)
        
        # Update chat history with the assistant's response
        chat_history.append({"role": "assistant", "content": {"text": response.text}})
    
    return render_template('index.html', user_input=user_input, response=response)

if __name__ == '__main__':
    app.run(debug=True)
