from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
import pickle
import os

# Step 1: Expanded training data
texts = [
    # ⚠️ Dark patterns
    "Only 3 left in stock!",
    "Act now! Offer ends soon.",
    "No thanks, I want to stay poor.",
    "Hurry before it's gone!",
    "This deal will expire in 10 minutes",
    "Don’t miss out!",
    "Subscribe now to unlock the deal",
    "You’ll regret skipping this offer",
    "We’ve reserved this just for you",
    "Limited availability remaining!",
    "Click before it's too late!",
    "Unsubscribe is hidden",
    "Why would you miss this?",
    "Unlock your gift now",

    # ✅ Normal content
    "Learn more about our services",
    "Sign in to your account",
    "Visit our blog for updates",
    "Follow us on social media",
    "Terms and conditions apply",
    "Thank you for visiting our website",
    "Product features listed below",
    "Add to cart",
    "Contact our support team",
    "Your preferences have been saved",
    "Create a new password",
    "Shipping policy and returns"
]

labels = [
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,  # dark patterns
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0         # normal phrases
]

# Step 2: Feature extraction with TF-IDF
vectorizer = TfidfVectorizer()
X = vectorizer.fit_transform(texts)

# Step 3: Train model
model = LogisticRegression()
model.fit(X, labels)

# Step 4: Save model and vectorizer
os.makedirs("ml", exist_ok=True)
with open("ml/model.pkl", "wb") as f:
    pickle.dump((model, vectorizer), f)

print("✅ Improved model trained and saved to ml/model.pkl")
