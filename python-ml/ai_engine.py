import json
import os
import re
from collections import Counter
from dotenv import load_dotenv
from groq import Groq
from data_prep import compute_sentiment, flesch_reading_ease

load_dotenv()

STOPWORDS = {
    "the", "and", "for", "with", "your", "this", "that", "from", "into",
    "our", "are", "you", "can", "will", "have", "has", "not", "all", "new",
    "get", "now", "more", "about", "today", "just", "make", "out", "how"
}


def analyze_content(text: str, target_keyword: str = "") -> dict:
    words = re.findall(r"[a-zA-Z]+", text)
    lower_words = [w.lower() for w in words]
    word_count = len(words)

    sentences = [s for s in re.split(r"[.!?]+", text) if s.strip()]
    sentence_count = max(1, len(sentences))

    sentiment_score = compute_sentiment(text)
    if sentiment_score > 0.15:
        sentiment_label = "Positive"
    elif sentiment_score < -0.15:
        sentiment_label = "Negative"
    else:
        sentiment_label = "Neutral"

    readability = flesch_reading_ease(text)
    filtered = [w for w in lower_words if len(w) > 3 and w not in STOPWORDS]
    top_keywords = [word for word, _ in Counter(filtered).most_common(5)]

    # Practical SEO & Clarity Score (0-100)
    seo_score = 50
    if 40 <= word_count <= 220:
        seo_score += 20
    if readability >= 55:
        seo_score += 15
    if sentiment_label == "Positive":
        seo_score += 10
    if target_keyword and target_keyword.lower() in text.lower():
        seo_score += 5
    seo_score = min(100, seo_score)

    return {
        "word_count": word_count,
        "sentence_count": sentence_count,
        "readability_score": readability,
        "sentiment_score": sentiment_score,
        "sentiment_label": sentiment_label,
        "seo_score": seo_score,
        "top_keywords": top_keywords,
    }


def _extract_json(raw_text: str) -> dict:
    cleaned = raw_text.strip()
    cleaned = re.sub(r"^```(?:json)?\s*", "", cleaned)
    cleaned = re.sub(r"\s*```$", "", cleaned)
    try:
        return json.loads(cleaned)
    except json.JSONDecodeError:
        match = re.search(r"\{.*\}", cleaned, re.DOTALL)
        if match:
            return json.loads(match.group(0))
        return {
            "headline": "Marketing Campaign Draft",
            "body": cleaned,
            "callToAction": "Learn more today!",
            "hashtags": ["#SmallBusiness", "#Marketing", "#ContentPulseAI", "#Growth"],
        }


def generate_marketing_content(
    business_name: str,
    topic: str,
    channel: str = "Instagram",
    tone: str = "Friendly",
    audience: str = "Local customers",
) -> dict:
    api_key = os.getenv("GROQ_API_KEY")
    if not api_key or api_key.startswith("gsk_replace"):
        raise ValueError("Please set a valid GROQ_API_KEY inside python-ml/.env")

    model = os.getenv("GROQ_MODEL", "openai/gpt-oss-20b")
    client = Groq(api_key=api_key)

    system_prompt = (
        "You are an expert marketing copywriter for small businesses. "
        "Return ONLY valid JSON with keys: headline (string), body (string), "
        "callToAction (string), and hashtags (array of 4 strings). No markdown fences."
    )

    user_prompt = (
        f"Generate high-converting {channel} marketing copy.\n"
        f"Business Name: {business_name}\n"
        f"Product/Offer: {topic}\n"
        f"Target Audience: {audience}\n"
        f"Tone: {tone}\n"
        f"Length: 60 to 130 words in the body."
    )

    completion = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.7,
        max_tokens=750,
    )

    raw_output = completion.choices[0].message.content or ""
    parsed = _extract_json(raw_output)

    headline = parsed.get("headline", "")
    body = parsed.get("body", "")
    cta = parsed.get("callToAction", "")
    hashtags = parsed.get("hashtags", [])

    full_text = f"{headline}. {body} {cta}".strip()
    analysis = analyze_content(full_text, target_keyword=topic.split()[0] if topic else "")

    return {
        "business_name": business_name,
        "channel": channel,
        "tone": tone,
        "model_used": model,
        "headline": headline,
        "body": body,
        "callToAction": cta,
        "hashtags": hashtags,
        "analysis": analysis,
    }


if __name__ == "__main__":
    sample = generate_marketing_content(
        business_name="Sunrise Brew Cafe",
        topic="Fresh filter coffee and warm butter croissants at 20% off",
        channel="Instagram",
        tone="Friendly",
        audience="Morning commuters and local coffee lovers",
    )
    print(json.dumps(sample, indent=2))