"""
Finance Tracker API
Main application entry point
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Finance Tracker API",
    description="API для управления личными финансами",
    version="0.0.1",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health", tags=["Health"])
async def health_check():
    """
    Health check endpoint
    
    Returns:
        dict: Status message
    """
    return {"status": "ok", "message": "Finance Tracker API is running"}


@app.get("/", tags=["Root"])
async def root():
    """
    Root endpoint
    
    Returns:
        dict: Welcome message
    """
    return {
        "message": "Welcome to Finance Tracker API",
        "docs": "/docs",
        "redoc": "/redoc",
    }
