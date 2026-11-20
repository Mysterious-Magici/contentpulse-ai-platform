import os
import re
import pandas as pd

os.makedirs("data", exist_ok=True)

POSITIVE_WORDS = {
    "fresh", "warm", "enjoy", "enjoying", "discover", "brighter", "free", "celebrate",
    "elegance", "effortlessly", "transform", "energy", "happy", "shiny", "beautiful",
    "gentle", "genuine", "calm", "mindful", "memorable", "crispy", "organic", "amazing",
    "artisan", "transparent", "complimentary", "save", "boost", "trusted", "excited",
    "best", "easy", "fast", "growth", "smart", "love", "crafted", "quality", "joy",
    "grateful", "gratitude", "wonderful", "awesome", "great", "good", "peaceful",
    "inspiring", "inspired", "proud", "smiling", "smile", "fun", "blessed", "success",
    "positive", "delight", "serene", "serenity", "hopeful", "hope", "vibrant", "thrilled"
}

NEGATIVE_WORDS = {
    "chronic", "stiffness", "drains", "costly", "heavy", "waiting", "limited", "terrible",
    "stress", "hard", "slow", "broken", "expensive", "confusing", "miss", "boring",
    "sad", "angry", "bad", "hate", "awful", "worst", "fear", "lonely", "heartbreak",
    "disappointed", "frustrated", "anxious", "grief", "pain", "dark", "lost", "regret",
    "overwhelmed", "exhausted", "miserable", "hopeless", "bitter", "despair", "trouble"
}


def count_syllables(word: str) -> int:
    cleaned = re.sub(r"[^a-z]", "", word.lower())
    if len(cleaned) <= 3:
        return 1
    vowel_groups = re.findall(r"[aeiouy]+", cleaned)
    count = len(vowel_groups) if vowel_groups else 1
    if cleaned.endswith("e") and count > 1:
        count -= 1
    return max(1, count)


def flesch_reading_ease(text: str) -> float:
    safe_text = str(text or "").strip()
    words = re.findall(r"[a-zA-Z]+", safe_text)
    word_count = len(words)
    if word_count == 0:
        return 60.0
    sentences = [s for s in re.split(r"[.!?]+", safe_text) if s.strip()]
    sentence_count = max(1, len(sentences))
    total_syllables = sum(count_syllables(w) for w in words)
    raw_score = (
        206.835
        - 1.015 * (word_count / sentence_count)
        - 84.6 * (total_syllables / word_count)
    )
    return round(max(0.0, min(100.0, raw_score)), 1)


def compute_sentiment(text: str) -> float:
    words = [w.lower() for w in re.findall(r"[a-zA-Z]+", str(text or ""))]
    pos = sum(1 for w in words if w in POSITIVE_WORDS)
    neg = sum(1 for w in words if w in NEGATIVE_WORDS)
    if pos + neg == 0:
        return 0.0
    return round((pos - neg) / (pos + neg), 2)


def label_sentiment(score: float) -> str:
    if score > 0.15:
        return "Positive"
    elif score < -0.15:
        return "Negative"
    return "Neutral"


def run_data_pipeline():
    input_path = os.path.join("data", "sentimentdataset.csv")
    raw_out = os.path.join("data", "raw_campaigns.csv")
    cleaned_out = os.path.join("data", "cleaned_campaigns.csv")

    if not os.path.exists(input_path):
        raise FileNotFoundError(
            f"Dataset not found at '{input_path}'. Place sentimentdataset.csv inside python-ml/data/."
        )

    df_raw = pd.read_csv(input_path)
    df_raw.to_csv(raw_out, index=False)
    print(f"Loaded raw dataset: {df_raw.shape[0]} rows, {df_raw.shape[1]} columns")

    
    unnamed_cols = [c for c in df_raw.columns if c.lower().startswith("unnamed")]
    df = df_raw.drop(columns=unnamed_cols, errors="ignore").copy()

    
    for col in df.select_dtypes(include=["object"]).columns:
        df[col] = df[col].astype(str).str.strip()

    
    df = df.rename(columns={
        "Text": "content",
        "Platform": "channel",
        "Sentiment": "original_sentiment",
        "Hashtags": "hashtags",
        "Likes": "likes",
        "Retweets": "retweets",
        "Country": "country",
        "User": "user",
        "Timestamp": "timestamp",
    })


    df = df.dropna(subset=["content", "channel"])
    df = df[df["content"].str.len() > 0]
    df["likes"] = pd.to_numeric(df["likes"], errors="coerce").fillna(df["likes"].median())
    df["retweets"] = pd.to_numeric(df["retweets"], errors="coerce").fillna(df["retweets"].median())

    before_dedup = len(df)
    df = df.drop_duplicates(subset=["content"]).reset_index(drop=True)
    print(f"Removed {before_dedup - len(df)} duplicate rows")


    df.insert(0, "campaign_id", range(101, 101 + len(df)))
    df["engagement_rate"] = ((df["likes"] + df["retweets"]) / 12.0).round(2)
    df["word_count"] = df["content"].apply(lambda x: len(re.findall(r"[a-zA-Z]+", x)))
    df["readability_score"] = df["content"].apply(flesch_reading_ease)
    df["sentiment_score"] = df["content"].apply(compute_sentiment)
    df["sentiment_label"] = df["sentiment_score"].apply(label_sentiment)

    df.to_csv(cleaned_out, index=False)
    print(f"Saved cleaned dataset to '{cleaned_out}': {df.shape[0]} rows, {df.shape[1]} columns")
    print("\nTop 5 cleaned rows preview:")
    print(df[["campaign_id", "channel", "engagement_rate", "readability_score", "sentiment_label"]].head())


if __name__ == "__main__":
    run_data_pipeline()