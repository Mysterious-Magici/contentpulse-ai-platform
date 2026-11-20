const mongoose = require("mongoose");

const contentItemSchema = new mongoose.Schema(
  {
    businessName: { type: String, required: true, trim: true },
    topic: { type: String, required: true, trim: true },
    channel: {
      type: String,
      enum: ["Instagram", "Email", "Product Description", "Google Ad", "Blog Intro"],
      default: "Instagram",
    },
    tone: { type: String, default: "Friendly" },
    audience: { type: String, default: "Local customers" },
    modelUsed: { type: String, default: "openai/gpt-oss-20b" },
    headline: { type: String, required: true },
    body: { type: String, required: true },
    callToAction: { type: String, default: "" },
    hashtags: [{ type: String }],
    analysis: {
      wordCount: Number,
      sentenceCount: Number,
      readabilityScore: Number,
      sentimentScore: Number,
      sentimentLabel: String,
      seoScore: Number,
      topKeywords: [String],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ContentItem", contentItemSchema);