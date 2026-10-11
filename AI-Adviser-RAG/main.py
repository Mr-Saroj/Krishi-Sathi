from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

from src.search import RAGSearch

app = FastAPI(
    title="Krishi Sathi AI Adviser API",
    description="RAG-based farming advice API",
    version="1.0.0"
)

# Initialize RAG pipeline once
rag_search = RAGSearch()


class ChatRequest(BaseModel):
    prompt: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="Farmer's question"
    )
    top_k: int = Field(default=3, ge=1, le=10)


class ChatResponse(BaseModel):
    prompt: str
    answer: str


@app.get("/")
def home():
    return {"message": "Krishi Sathi AI Adviser API is running"}


# Existing endpoint: returns the complete answer as JSON
@app.post("/api/adviser/chat", response_model=ChatResponse)
def chat(request: ChatRequest):
    try:
        answer = "".join(
            rag_search.search_and_summarize(
                request.prompt,
                top_k=request.top_k
            )
        )

        return ChatResponse(
            prompt=request.prompt,
            answer=answer
        )

    except Exception as e:
        print(f"RAG processing failed: {e}")
        raise HTTPException(
            status_code=500,
            detail="Unable to generate farming advice"
        )


# New endpoint: streams answer chunks as they are generated
@app.post("/api/adviser/chat/stream")
def chat_stream(request: ChatRequest):
    try:
        answer_stream = rag_search.search_and_summarize(
            request.prompt,
            top_k=request.top_k
        )

        return StreamingResponse(
            answer_stream,
            media_type="text/plain; charset=utf-8",
            headers={
                "Cache-Control": "no-cache",
                "X-Accel-Buffering": "no"
            }
        )

    except Exception as e:
        print(f"RAG streaming failed: {e}")
        raise HTTPException(
            status_code=500,
            detail="Unable to start farming advice stream"
        )