from src import create_app
from waitress import serve
import os


app = create_app()
serve(app, port=os.getenv("PORT", default=8000))
