import uvicorn
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import httpx
from starlette.staticfiles import StaticFiles

base_url = "https://todo.doczilla.pro"

api_app = FastAPI(title="api app")
app = FastAPI()

app.mount("/api", api_app)
app.mount("/", StaticFiles(directory="frontend", html=True), name="static")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@api_app.get("/todos")
async def proxy_todos(limit: int = None, offset: int = None):
    async with httpx.AsyncClient() as client:
        response = await client.get(f"{base_url}/api/todos", params={"limit": limit, "offset": offset})
        return response.json()


@api_app.get("/todos/date")
async def proxy_todos_date(from_date: int, to_date: int, status: bool = None, limit: int = None, offset: int = None):
    async with httpx.AsyncClient() as client:
        params = {"from": from_date, "to": to_date, "status": status, "limit": limit, "offset": offset}
        response = await client.get(f"{base_url}/api/todos/date", params=params)
        return response.json()


@api_app.get("/todos/find")
async def proxy_todos_find(q: str, limit: int = None, offset: int = None):
    async with httpx.AsyncClient() as client:
        params = {"q": q, "limit": limit, "offset": offset}
        response = await client.get(f"{base_url}/api/todos/find", params=params)
        return response.json()


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
