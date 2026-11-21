#  ContentPulse AI

**AI-Powered Content Generation & NLP Analytics Platform for Small Businesses**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Visit%20App-4F46E5?style=for-the-badge&logo=vercel&logoColor=white)](https://contentpulse-ai-platform.vercel.app/)

ContentPulse AI is a full-stack generative marketing and Natural Language Processing (NLP) analytics platform tailored for small businesses, startups, and freelancers. It pairs ultra-fast LLM inference via Groq with real-time copy evaluation (SEO scoring, Flesch readability, sentiment analysis, and keyword extraction) and interactive campaign performance tracking.

---

##  Live Application

Explore the live platform here: **[https://contentpulse-ai-platform.vercel.app/](https://contentpulse-ai-platform.vercel.app/)**

---

##  Key Features

- **AI Content Studio**: Generate tailored marketing copy across 5 channels (*Instagram, Email, Product Description, Google Ad, Blog Intro*) and 7 brand tones (*Friendly, Professional, Urgent, Warm, Luxury, Motivational, Playful*).
- **Configurable Groq LLM Engine**: Select between fast open-weight models (including `openai/gpt-oss-20b`) directly from the UI.
- **Draft NLP Analyzer**: Audit any existing marketing draft with instant metrics for **SEO Score (0–100)**, **Flesch Readability**, **Sentiment Polarity**, **Word/Sentence Counts**, and **Top Extracted Keywords** (with a +5 SEO bonus for target keyword optimization).
- **Analytics & Campaign History**: Monitor aggregate campaign KPIs, compare average SEO scores across channels via Recharts bar charts, visualize sentiment breakdowns, and manage saved campaign history.
- **One-Click Copywriting Export**: Copy generated headlines, body copy, calls-to-action, and hashtags directly to the clipboard.

---

## 📸 Application Showcase & Feature Walkthrough

> **Note for Repository Setup:** Place your 5 screenshots inside an `assets/` folder in the root of your repository using the exact filenames referenced below (`assets/channel-selection.png`, `assets/tone-model-selection.png`, `assets/generated-copy-metrics.png`, `assets/analytics-history.png`, `assets/draft-nlp-analyzer.png`) so GitHub renders every image automatically.

| Preview | Feature Title | Detailed Description |
| :--- | :--- | :--- |
| ![Channel-Specific Marketing Copy Studio](assets/channel-selection.png) | **1. Multi-Channel Marketing Copy Studio** | Displays the primary **AI Content Studio** workspace where users input their Business Name, Product/Offer/Topic, and Target Audience, and select from five dedicated marketing formats: **Instagram, Email, Product Description, Google Ad, and Blog Intro**. |
| ![Brand Tone & Groq Model Configuration](assets/tone-model-selection.png) | **2. Brand Tone & Groq LLM Selector** | Highlights the customization controls allowing businesses to tailor messaging voice across seven distinct tones (**Friendly, Professional, Urgent, Warm, Luxury, Motivational, and Playful**) while choosing their preferred **Groq inference model** (`openai/gpt-oss-20b`). |
| ![Generated Campaign Output & Instant NLP Scorecard](assets/generated-copy-metrics.png) | **3. AI Copy Generation & Instant NLP Scorecard** | Showcases a complete generated Instagram campaign complete with a headline, persuasive body copy, Call to Action (CTA), relevant hashtags, a one-click **Copy Copywriting** button, and real-time quality badges (**SEO Score: 100/100, Readability: 65.4, Positive Sentiment, Word Count: 97**). |
| ![Saved Campaigns & Live Recharts Analytics](assets/analytics-history.png) | **4. Campaign History & Live Recharts Analytics** | Illustrates the **Analytics & History** dashboard tracking aggregate metrics (**Total Campaigns, Avg SEO Score, Avg Readability**), interactive **Avg SEO Score by Channel** bar charts, a **Sentiment Breakdown** donut chart, and searchable/deletable saved campaign records. |
| ![Draft NLP Analyzer & Keyword Extractor](assets/draft-nlp-analyzer.png) | **5. Standalone Draft NLP Quality Analyzer** | Demonstrates the **Draft NLP Analyzer** tab where users can paste any custom marketing draft and optional target keyword (+5 SEO bonus) to receive an instant **NLP Quality Report** detailing SEO score, Flesch readability, sentiment polarity, word/sentence counts, and automatically extracted keywords. |

---

##  Tech Stack

- **Frontend**: React, Tailwind CSS, Lucide Icons, Recharts
- **Backend & AI Inference**: Node.js / Python API, Groq SDK (`openai/gpt-oss-20b`), Custom NLP Scoring Engine (Flesch Readability, Sentiment & Keyword Extraction)
- **Deployment**: Vercel (Frontend) & Render (Backend API)

---

##  Local Setup & Installation

1. **Clone the repository**
   ```bash
   git clone [https://github.com/Mysterious-Magici/contentpulse-ai-platform.git](https://github.com/Mysterious-Magici/contentpulse-ai-platform.git)
   cd contentpulse-ai-platform
