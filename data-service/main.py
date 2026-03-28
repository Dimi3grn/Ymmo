from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import stats, predictions, scoring

app = FastAPI(
    title="Ymmo Data Service",
    description="Microservice d'analyse et prédiction immobilière",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5062"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(stats.router, prefix="/api/stats", tags=["Statistiques"])
app.include_router(predictions.router, prefix="/api/predictions", tags=["Prédictions"])
app.include_router(scoring.router, prefix="/api/scores", tags=["Scoring"])


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "ymmo-data"}
