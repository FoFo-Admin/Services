from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app import b_router, db_helper, models, broker
from settings import settings

models.Base.metadata.create_all(bind=db_helper.engine)


@asynccontextmanager
async def lifespan(app: FastAPI):
    await broker.rabbitAsync.get_connection()
    yield
    await broker.rabbitAsync.close_connection()


app = FastAPI(lifespan=lifespan)
app.include_router(b_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.front],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def is_active():
    return {
        "Server": True
    }

# @app.on_event("startup")
# def startup_event():
#     broker.initRabbit()

if __name__ == '__main__':
    uvicorn.run("main:app", host=settings.host, port=settings.port, reload=True)
