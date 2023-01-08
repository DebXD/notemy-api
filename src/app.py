from flask import Flask, jsonify

app = Flask(__name__)

@app.route("/")
def hello():
    return "hello world"

@app.route("/hello/")
def ola():
    return jsonify({"message" : "HELOO WORLD"})