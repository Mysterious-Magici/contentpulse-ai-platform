from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from ai_engine import generate_marketing_content, analyze_content

app = FastAPI(title="ContentPulse Python AI & NLP Engine", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class GenerateRequest(BaseModel):
    business_name: str
    topic: str
    channel: str = "Instagram"
    tone: str = "Friendly"
    audience: str = "Local customers"


class AnalyzeRequest(BaseModel):
    text: str
    target_keyword: str = ""


@app.get("/")
def health_check():
    return {"status": "ok", "service": "ContentPulse Python AI Engine"}


@app.post("/generate")
def api_generate(req: GenerateRequest):
    try:
        return generate_marketing_content(
            business_name=req.business_name,
            topic=req.topic,
            channel=req.channel,
            tone=req.tone,
            audience=req.audience,
        )
    except Exception as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@app.post("/analyze")
def api_analyze(req: AnalyzeRequest):
    return analyze_content(req.text, req.target_keyword)