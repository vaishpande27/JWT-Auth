from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer, util

app = Flask(__name__)
model = SentenceTransformer('all-MiniLM-L6-v2')

@app.route('/compare', methods=['POST'])
def compare():
    data = request.get_json()
    job_text = data.get('job')
    resumes = data.get('resumes')  # list of resume texts

    job_embedding = model.encode(job_text, convert_to_tensor=True)
    scores = []

    for resume_text in resumes:
        resume_embedding = model.encode(resume_text, convert_to_tensor=True)
        similarity = util.cos_sim(job_embedding, resume_embedding).item()
        scores.append(round(similarity * 100, 2))  # Scale to 0–100

    return jsonify({ "scores": scores })

if __name__ == '__main__':
    app.run(port=5001)
