import os
import pandas as pd
import matplotlib.pyplot as plt
import seaborn as sns

os.makedirs("charts", exist_ok=True)
sns.set_theme(style="whitegrid")


def run_analysis():
    csv_path = os.path.join("data", "cleaned_campaigns.csv")
    if not os.path.exists(csv_path):
        raise FileNotFoundError(
            "Run 'python data_prep.py' first to generate data/cleaned_campaigns.csv."
        )

    df = pd.read_csv(csv_path)

    print("=== MODULE 14: SMALL BUSINESS CONTENT KPI SUMMARY ===")
    summary = (
        df.groupby("channel")
        .agg(
            campaigns=("campaign_id", "count"),
            avg_engagement=("engagement_rate", "mean"),
            avg_readability=("readability_score", "mean"),
            avg_sentiment=("sentiment_score", "mean"),
        )
        .round(2)
        .sort_values(by="avg_engagement", ascending=False)
    )
    print(summary)

    
    plt.figure(figsize=(8, 4.5))
    ax1 = sns.barplot(
        data=df,
        x="channel",
        y="engagement_rate",
        hue="channel",
        palette="viridis",
        errorbar=None,
        legend=False,
    )
    ax1.set_title(
        "Average Engagement Rate (%) by Marketing Channel",
        fontsize=13,
        fontweight="bold",
    )
    ax1.set_xlabel("Channel")
    ax1.set_ylabel("Engagement Rate (%)")
    plt.xticks(rotation=15)
    plt.tight_layout()
    plt.savefig("charts/channel_engagement.png", dpi=180)
    plt.close()

    
    plt.figure(figsize=(7, 4.5))
    counts = df["sentiment_label"].value_counts()
    ax2 = sns.barplot(
        x=counts.index,
        y=counts.values,
        hue=counts.index,
        palette="Set2",
        legend=False,
    )
    ax2.set_title("Sentiment Category Distribution", fontsize=13, fontweight="bold")
    ax2.set_xlabel("Sentiment Category")
    ax2.set_ylabel("Number of Campaigns")
    plt.tight_layout()
    plt.savefig("charts/sentiment_distribution.png", dpi=180)
    plt.close()

    
    plt.figure(figsize=(8, 4.5))
    ax3 = sns.scatterplot(
        data=df,
        x="readability_score",
        y="engagement_rate",
        hue="channel",
        alpha=0.65,
    )
    ax3.set_title("Readability Score vs. Engagement Rate", fontsize=13, fontweight="bold")
    ax3.set_xlabel("Flesch Reading Ease Score")
    ax3.set_ylabel("Engagement Rate (%)")
    plt.tight_layout()
    plt.savefig("charts/readability_vs_engagement.png", dpi=180)
    plt.close()

    print("\nSaved charts to python-ml/charts/:")
    print(" - charts/channel_engagement.png")
    print(" - charts/sentiment_distribution.png")
    print(" - charts/readability_vs_engagement.png")


if __name__ == "__main__":
    run_analysis()