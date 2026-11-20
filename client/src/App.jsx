import { useState, useEffect } from "react";
import { api } from "./api";
import {
  Sparkles,
  FileSearch,
  BarChart3,
  Copy,
  Check,
  Trash2,
  RefreshCw,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const PIE_COLORS = ["#0d9488", "#6366f1", "#e11d48"];

export default function App() {
  const [activeTab, setActiveTab] = useState("studio");

  // AI Studio state
  const [form, setForm] = useState({
    businessName: "",
    topic: "",
    channel: "Instagram",
    tone: "Friendly",
    audience: "Local customers",
    model: "openai/gpt-oss-20b",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  // Analyzer tab state
  const [draftText, setDraftText] = useState("");
  const [targetKeyword, setTargetKeyword] = useState("");
  const [draftAnalysis, setDraftAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Analytics & history tab state
  const [history, setHistory] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loadingDash, setLoadingDash] = useState(false);

  const loadDashboard = async () => {
    setLoadingDash(true);
    setError("");
    try {
      const [histRes, statsRes] = await Promise.all([
        api.get("/"),
        api.get("/analytics"),
      ]);
      setHistory(histRes.data);
      setAnalytics(statsRes.data);
    } catch {
      setError(
        "Could not load analytics. Verify your backend server is running and MongoDB is connected."
      );
    } finally {
      setLoadingDash(false);
    }
  };

  useEffect(() => {
    if (activeTab === "analytics") {
      loadDashboard();
    }
  }, [activeTab]);

  const handleGenerate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);
    setCopied(false);

    try {
      const res = await api.post("/generate", form);
      setResult(res.data);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Failed to generate content. Check GROQ_API_KEY and backend logs."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleCopyResult = async () => {
    if (!result) return;
    const tags = Array.isArray(result.hashtags) ? result.hashtags.join(" ") : "";
    const formatted = `${result.headline}\n\n${result.body}\n\nCTA: ${result.callToAction}\n${tags}`;
    await navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAnalyzeDraft = async (e) => {
    e.preventDefault();
    setAnalyzing(true);
    setError("");
    try {
      const res = await api.post("/analyze", {
        text: draftText,
        targetKeyword,
      });
      setDraftAnalysis(res.data);
    } catch (err) {
      setError(err.response?.data?.error || "Could not analyze draft text.");
    } finally {
      setAnalyzing(false);
    }
  };

  const handleDeleteItem = async (id) => {
    try {
      await api.delete(`/${id}`);
      loadDashboard();
    } catch {
      setError("Failed to delete campaign item.");
    }
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <h1>
          <Sparkles size={26} /> ContentPulse AI
        </h1>
        <p>
          AI-Powered Content Generation &amp; NLP Analytics Platform for Small
          Businesses
        </p>
      </header>

      <nav className="tabs">
        <button
          type="button"
          className={`tab-btn ${activeTab === "studio" ? "active" : ""}`}
          onClick={() => {
            setError("");
            setActiveTab("studio");
          }}
        >
          <Sparkles size={17} /> AI Content Studio
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === "analyzer" ? "active" : ""}`}
          onClick={() => {
            setError("");
            setActiveTab("analyzer");
          }}
        >
          <FileSearch size={17} /> Draft NLP Analyzer
        </button>
        <button
          type="button"
          className={`tab-btn ${activeTab === "analytics" ? "active" : ""}`}
          onClick={() => {
            setError("");
            setActiveTab("analytics");
          }}
        >
          <BarChart3 size={17} /> Analytics &amp; History
        </button>
      </nav>

      {error && <div className="error-box">{error}</div>}

      {activeTab === "studio" && (
        <section className="panel">
          <h2>Generate Channel-Specific Marketing Copy</h2>
          <form onSubmit={handleGenerate}>
            <div className="grid-2">
              <div>
                <label htmlFor="businessName">Business Name</label>
                <input
                  id="businessName"
                  type="text"
                  placeholder="e.g., Sunrise Brew Cafe"
                  value={form.businessName}
                  onChange={(e) =>
                    setForm({ ...form, businessName: e.target.value })
                  }
                  required
                />
              </div>
              <div>
                <label htmlFor="topic">Product / Offer / Topic</label>
                <input
                  id="topic"
                  type="text"
                  placeholder="e.g., 20% off morning filter coffee & croissants"
                  value={form.topic}
                  onChange={(e) => setForm({ ...form, topic: e.target.value })}
                  required
                />
              </div>
              <div>
                <label htmlFor="channel">Marketing Channel</label>
                <select
                  id="channel"
                  value={form.channel}
                  onChange={(e) =>
                    setForm({ ...form, channel: e.target.value })
                  }
                >
                  <option value="Instagram">Instagram</option>
                  <option value="Email">Email</option>
                  <option value="Product Description">Product Description</option>
                  <option value="Google Ad">Google Ad</option>
                  <option value="Blog Intro">Blog Intro</option>
                </select>
              </div>
              <div>
                <label htmlFor="tone">Brand Tone</label>
                <select
                  id="tone"
                  value={form.tone}
                  onChange={(e) => setForm({ ...form, tone: e.target.value })}
                >
                  <option value="Friendly">Friendly</option>
                  <option value="Professional">Professional</option>
                  <option value="Urgent">Urgent</option>
                  <option value="Warm">Warm</option>
                  <option value="Luxury">Luxury</option>
                  <option value="Motivational">Motivational</option>
                  <option value="Playful">Playful</option>
                </select>
              </div>
              <div>
                <label htmlFor="audience">Target Audience</label>
                <input
                  id="audience"
                  type="text"
                  value={form.audience}
                  onChange={(e) =>
                    setForm({ ...form, audience: e.target.value })
                  }
                />
              </div>
              <div>
                <label htmlFor="model">Groq Model</label>
                <select
                  id="model"
                  value={form.model}
                  onChange={(e) => setForm({ ...form, model: e.target.value })}
                >
                  <option value="openai/gpt-oss-20b">
                    openai/gpt-oss-20b (Fast Default)
                  </option>
                  <option value="openai/gpt-oss-120b">
                    openai/gpt-oss-120b (Deep Reasoning)
                  </option>
                </select>
              </div>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              <Sparkles size={17} />
              {loading ? "Generating & Scoring..." : "Generate Campaign Copy"}
            </button>
          </form>

          {result && (
            <div className="result-card">
              <div className="result-header">
                <div>
                  <span className="badge">{result.channel}</span>
                  <span className="badge">{result.tone}</span>
                  <span className="badge">{result.modelUsed}</span>
                </div>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={handleCopyResult}
                >
                  {copied ? <Check size={15} /> : <Copy size={15} />}
                  {copied ? "Copied!" : "Copy Copywriting"}
                </button>
              </div>

              <h3>{result.headline}</h3>
              <p style={{ marginTop: "8px" }}>{result.body}</p>
              {result.callToAction && (
                <p style={{ marginTop: "10px", fontWeight: 700 }}>
                  Call to Action: {result.callToAction}
                </p>
              )}

              {Array.isArray(result.hashtags) && result.hashtags.length > 0 && (
                <div className="hashtags">
                  {result.hashtags.map((tag, idx) => (
                    <span key={idx} className="tag">
                      {tag.startsWith("#") ? tag : `#${tag}`}
                    </span>
                  ))}
                </div>
              )}

              {result.analysis && (
                <div className="metrics-row">
                  <div className="metric-box">
                    <div className="label">SEO Score</div>
                    <div className="value">{result.analysis.seoScore}/100</div>
                  </div>
                  <div className="metric-box">
                    <div className="label">Readability</div>
                    <div className="value">
                      {result.analysis.readabilityScore}
                    </div>
                  </div>
                  <div className="metric-box">
                    <div className="label">Sentiment</div>
                    <div className="value">{result.analysis.sentimentLabel}</div>
                  </div>
                  <div className="metric-box">
                    <div className="label">Word Count</div>
                    <div className="value">{result.analysis.wordCount}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {activeTab === "analyzer" && (
        <section className="panel">
          <h2>Analyze Any Draft Copy (Readability, Sentiment &amp; SEO)</h2>
          <form onSubmit={handleAnalyzeDraft}>
            <div>
              <label htmlFor="draftText">Paste Your Marketing Draft</label>
              <textarea
                id="draftText"
                placeholder="Paste an Instagram caption, email subject/body, ad copy, or product description..."
                value={draftText}
                onChange={(e) => setDraftText(e.target.value)}
                required
              />
            </div>
            <div style={{ marginTop: "12px", maxWidth: "360px" }}>
              <label htmlFor="targetKeyword">
                Target Keyword (Optional +5 SEO bonus)
              </label>
              <input
                id="targetKeyword"
                type="text"
                placeholder="e.g., coffee or skincare"
                value={targetKeyword}
                onChange={(e) => setTargetKeyword(e.target.value)}
              />
            </div>
            <button type="submit" className="btn-primary" disabled={analyzing}>
              <FileSearch size={17} />
              {analyzing ? "Analyzing..." : "Analyze Draft"}
            </button>
          </form>

          {draftAnalysis && (
            <div className="result-card">
              <h3>NLP Quality Report</h3>
              <div className="metrics-row">
                <div className="metric-box">
                  <div className="label">SEO Score</div>
                  <div className="value">{draftAnalysis.seoScore}/100</div>
                </div>
                <div className="metric-box">
                  <div className="label">Flesch Readability</div>
                  <div className="value">{draftAnalysis.readabilityScore}</div>
                </div>
                <div className="metric-box">
                  <div className="label">Sentiment</div>
                  <div className="value">
                    {draftAnalysis.sentimentLabel} ({draftAnalysis.sentimentScore})
                  </div>
                </div>
                <div className="metric-box">
                  <div className="label">Words / Sentences</div>
                  <div className="value">
                    {draftAnalysis.wordCount} / {draftAnalysis.sentenceCount}
                  </div>
                </div>
              </div>

              {Array.isArray(draftAnalysis.topKeywords) &&
                draftAnalysis.topKeywords.length > 0 && (
                  <div className="hashtags" style={{ marginTop: "14px" }}>
                    {draftAnalysis.topKeywords.map((kw, i) => (
                      <span key={i} className="tag">
                        Keyword: {kw}
                      </span>
                    ))}
                  </div>
                )}
            </div>
          )}
        </section>
      )}

      {activeTab === "analytics" && (
        <section className="panel">
          <div className="result-header">
            <h2>Saved Campaigns &amp; Live Recharts Analytics</h2>
            <button
              type="button"
              className="btn-outline"
              onClick={loadDashboard}
              disabled={loadingDash}
            >
              <RefreshCw size={15} />
              {loadingDash ? "Refreshing..." : "Refresh Data"}
            </button>
          </div>

          {analytics && (
            <>
              <div className="metrics-row">
                <div className="metric-box">
                  <div className="label">Total Campaigns</div>
                  <div className="value">{analytics.totalItems}</div>
                </div>
                <div className="metric-box">
                  <div className="label">Avg SEO Score</div>
                  <div className="value">{analytics.avgSeoScore}/100</div>
                </div>
                <div className="metric-box">
                  <div className="label">Avg Readability</div>
                  <div className="value">{analytics.avgReadability}</div>
                </div>
              </div>

              <div className="charts-grid">
                <div className="result-card">
                  <h3>Avg SEO Score by Channel</h3>
                  <div style={{ width: "100%", height: 260 }}>
                    <ResponsiveContainer>
                      <BarChart data={analytics.channelStats || []}>
                        <XAxis dataKey="channel" />
                        <YAxis domain={[0, 100]} />
                        <Tooltip />
                        <Bar
                          dataKey="avgSeoScore"
                          fill="#4338ca"
                          radius={[6, 6, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="result-card">
                  <h3>Sentiment Breakdown</h3>
                  <div style={{ width: "100%", height: 260 }}>
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={analytics.sentimentBreakdown || []}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={85}
                          label
                        >
                          {(analytics.sentimentBreakdown || []).map(
                            (entry, index) => (
                              <Cell
                                key={`cell-${index}`}
                                fill={PIE_COLORS[index % PIE_COLORS.length]}
                              />
                            )
                          )}
                        </Pie>
                        <Tooltip />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </>
          )}

          <h3 style={{ marginTop: "22px" }}>Saved Campaign History</h3>
          {history.length === 0 ? (
            <p style={{ marginTop: "10px", color: "#64748b" }}>
              No saved campaigns yet. Generate one in the AI Content Studio tab!
            </p>
          ) : (
            history.map((item) => (
              <div key={item._id} className="history-item">
                <div className="history-top">
                  <div>
                    <strong>{item.businessName}</strong> —{" "}
                    <span className="badge">{item.channel}</span>
                    <span className="badge">{item.tone}</span>
                    <span className="badge">
                      SEO: {item.analysis?.seoScore ?? "—"}/100
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn-danger"
                    onClick={() => handleDeleteItem(item._id)}
                  >
                    <Trash2 size={14} /> Delete
                  </button>
                </div>
                <h4 style={{ marginTop: "8px" }}>{item.headline}</h4>
                <p style={{ marginTop: "4px", color: "#334155" }}>{item.body}</p>
              </div>
            ))
          )}
        </section>
      )}
    </div>
  );
}