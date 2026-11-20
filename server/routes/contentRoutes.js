const express = require("express");
const Groq = require("groq-sdk");
const ContentItem = require("../models/ContentItem");
const { analyzeText } = require("../utils/textAnalyzer");

const router = express.Router();

function parseJsonResponse(rawText) {
  let cleaned = String(rawText || "").trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]);
    }
    return {
      headline: "Fresh Campaign Highlight",
      body: cleaned,
      callToAction: "Visit us today to learn more!",
      hashtags: ["#SmallBusiness", "#LocalOffer", "#ContentPulseAI", "#Growth"],
    };
  }
}


router.post("/generate", async (req, res) => {
  try {
    const {
      businessName,
      topic,
      channel = "Instagram",
      tone = "Friendly",
      audience = "Local customers",
      model,
    } = req.body;

    if (!businessName || !topic) {
      return res
        .status(400)
        .json({ error: "Business name and topic are required." });
    }

    if (!process.env.GROQ_API_KEY) {
      return res
        .status(500)
        .json({ error: "GROQ_API_KEY is not configured on the server." });
    }

    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const selectedModel =
      model || process.env.GROQ_MODEL || "openai/gpt-oss-20b";

    const systemPrompt =
      "You are an expert marketing copywriter for small businesses. " +
      "Return ONLY valid JSON with keys: headline (string), body (string), " +
      "callToAction (string), and hashtags (array of 4 strings). No markdown fences.";

    const userPrompt =
      `Generate high-converting ${channel} marketing copy.\n` +
      `Business Name: ${businessName}\n` +
      `Product/Offer: ${topic}\n` +
      `Target Audience: ${audience}\n` +
      `Tone: ${tone}\n` +
      `Length: 60 to 130 words in the body.`;

    const completion = await groq.chat.completions.create({
      model: selectedModel,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.7,
      max_tokens: 750,
    });

    const rawOutput = completion.choices?.[0]?.message?.content || "";
    const parsed = parseJsonResponse(rawOutput);

    const headline = String(parsed.headline || "").trim();
    const body = String(parsed.body || "").trim();
    const callToAction = String(parsed.callToAction || "").trim();
    const hashtags = Array.isArray(parsed.hashtags)
      ? parsed.hashtags.map((h) => String(h).trim()).filter(Boolean).slice(0, 4)
      : [];

    const combinedText = `${headline}. ${body} ${callToAction}`.trim();
    const analysis = analyzeText(combinedText, topic.split(/\s+/)[0] || "");

    const savedItem = await ContentItem.create({
      businessName: businessName.trim(),
      topic: topic.trim(),
      channel,
      tone,
      audience,
      modelUsed: selectedModel,
      headline,
      body,
      callToAction,
      hashtags,
      analysis,
    });

    return res.status(201).json(savedItem);
  } catch (error) {
    console.error("Error in /generate:", error);
    return res
      .status(500)
      .json({ error: error.message || "Failed to generate content." });
  }
});


router.post("/analyze", (req, res) => {
  const { text, targetKeyword = "" } = req.body;
  if (!text || !String(text).trim()) {
    return res.status(400).json({ error: "Please provide text to analyze." });
  }
  const analysis = analyzeText(text, targetKeyword);
  return res.json(analysis);
});


router.get("/", async (req, res) => {
  try {
    const items = await ContentItem.find().sort({ createdAt: -1 }).limit(50);
    return res.json(items);
  } catch (error) {
    console.error("Error fetching content history:", error);
    return res.status(500).json({ error: "Failed to load content history." });
  }
});


router.get("/analytics", async (req, res) => {
  try {
    const items = await ContentItem.find();
    const totalItems = items.length;

    const avgReadability =
      totalItems > 0
        ? Number(
            (
              items.reduce(
                (sum, i) => sum + (i.analysis?.readabilityScore || 0),
                0
              ) / totalItems
            ).toFixed(1)
          )
        : 0;

    const avgSeoScore =
      totalItems > 0
        ? Math.round(
            items.reduce((sum, i) => sum + (i.analysis?.seoScore || 0), 0) /
              totalItems
          )
        : 0;

    const sentimentMap = { Positive: 0, Neutral: 0, Negative: 0 };
    const channelMap = {};

    items.forEach((item) => {
      const sLabel = item.analysis?.sentimentLabel || "Neutral";
      sentimentMap[sLabel] = (sentimentMap[sLabel] || 0) + 1;

      const ch = item.channel || "Instagram";
      if (!channelMap[ch]) {
        channelMap[ch] = {
          channel: ch,
          count: 0,
          seoSum: 0,
          readabilitySum: 0,
        };
      }
      channelMap[ch].count += 1;
      channelMap[ch].seoSum += item.analysis?.seoScore || 0;
      channelMap[ch].readabilitySum += item.analysis?.readabilityScore || 0;
    });

    const sentimentBreakdown = Object.entries(sentimentMap).map(
      ([name, value]) => ({ name, value })
    );

    const channelStats = Object.values(channelMap).map((c) => ({
      channel: c.channel,
      campaigns: c.count,
      avgSeoScore: Math.round(c.seoSum / c.count),
      avgReadability: Number((c.readabilitySum / c.count).toFixed(1)),
    }));

    return res.json({
      totalItems,
      avgReadability,
      avgSeoScore,
      sentimentBreakdown,
      channelStats,
    });
  } catch (error) {
    console.error("Error in /analytics:", error);
    return res.status(500).json({ error: "Failed to compute analytics." });
  }
});


router.delete("/:id", async (req, res) => {
  try {
    const deleted = await ContentItem.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Campaign item not found." });
    }
    return res.json({ message: "Deleted successfully", id: req.params.id });
  } catch (error) {
    console.error("Error deleting item:", error);
    return res.status(500).json({ error: "Failed to delete item." });
  }
});

module.exports = router;