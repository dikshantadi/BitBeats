from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def amigos():
    return "welcome to BitBeat"