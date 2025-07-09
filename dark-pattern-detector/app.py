from flask import Flask, request, jsonify
from flask_cors import CORS
import pickle
import os

app = Flask(__name__)
CORS(app)

# Load ML model and vectorizer
try:
    with open("ml/model.pkl", "rb") as f:
        model, vectorizer = pickle.load(f)
    print("✅ Model and vectorizer loaded successfully.")
except Exception as e:
    print("❌ Error loading model:", e)
    exit()

# Heuristic rules for dark pattern detection
def heuristic_check(text):
    lowered = text.lower()
    findings = []

    if "urgent" in lowered or "limited time" in lowered or "act now" in lowered:
        findings.append("⚠️ Fake Urgency")
    if "subscribe" in lowered and "hard to cancel" in lowered:
        findings.append("😬 Confirmshaming")
    if "only" in lowered and "left" in lowered:
        findings.append("⏱️ Scarcity Trick")
    if "don’t miss out" in lowered or "don't miss out" in lowered:
        findings.append("📢 FOMO Tactic")
    if "you’ll regret" in lowered:
        findings.append("😢 Emotional Manipulation")
    if "click before it’s too late" in lowered:
        findings.append("🚨 Time Pressure")
    if "unsubscribe" in lowered and "click here" not in lowered:
        findings.append("🕵️ Hidden Unsubscribe Option")

    return findings if findings else ["✅ No dark patterns detected by heuristics."]

# Main endpoint for both ML and heuristics
@app.route("/analyze", methods=["POST"])
def analyze():
    data = request.get_json()
    text = data.get("text", "").strip()

    if not text:
        return jsonify({"error": "No input text provided"}), 400

    try:
        X = vectorizer.transform([text])
        prediction = model.predict(X)[0]
        confidence = model.predict_proba(X)[0][prediction]
    except Exception as e:
        return jsonify({"error": f"Model prediction failed: {str(e)}"}), 500

    heuristic_results = heuristic_check(text)

    return jsonify({
        "is_dark_pattern": bool(prediction),
        "ml_confidence": float(confidence),
        "heuristics": heuristic_results
    })

if __name__ == "__main__":
    app.run(port=5000, debug=True)
