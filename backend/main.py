import sys
import os
from fastapi import FastAPI, Form
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv
import google.generativeai as genai
import requests
from fastapi import FastAPI, Form
from routers.agent_orchestrator import route_to_agent




# Set up environment variables
load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
genai.configure(api_key=GEMINI_API_KEY)

# Fix Python import path
sys.path.append(os.path.abspath(os.path.dirname(__file__)))

from models.store import save_widget, get_widget_by_id
from agents.web_agent import handle_prompt

app = FastAPI()

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

# Gemini response
@app.post("/gemini/")
def gemini_response(prompt: str = Form(...)):
    model = genai.GenerativeModel(model_name="gemini-1.5-pro")
    response = model.generate_content(prompt)
    return {"response": response.text}

@app.post("/agent/")
async def agent_entry(prompt: str = Form(...)):
    return await route_to_agent(prompt)


# Chart query (when user clicks 📊)
@app.post("/query/")
def query(agent: str = Form(...), prompt: str = Form(...)):
    result = handle_prompt(prompt)
    return {"response": result["data"], "endpoint": result["endpoint"]}

# Save a chart as widget
@app.post("/save_widget/")
def save(title: str = Form(...), data: str = Form(...), endpoint: str = Form(...)):
    return save_widget(title, data, endpoint)

# Retrieve a saved widget
@app.get("/widget/{widget_id}")
def get_widget(widget_id: str):
    return get_widget_by_id(widget_id)


@app.post("/gemini/visualize/")
def gemini_visual(prompt: str = Form(...)):
    import requests
    import json

    # Step 1: Keyword → API Mapping
    api_map = {
        "gdp": "https://api.worldbank.org/v2/country/WLD/indicator/NY.GDP.MKTP.KD.ZG?format=json&per_page=500",
        "co2": "https://api.worldbank.org/v2/country/WLD/indicator/EN.GHG.CO2.AG.MT.CE.AR5?format=json&per_page=500",
        "agricultural": "https://api.worldbank.org/v2/country/WLD/indicator/AG.LND.AGRI.ZS?format=json&per_page=500"
    }

    prompt_lower = prompt.lower()
    matched_api = None

    for key, url in api_map.items():
        if key in prompt_lower:
            matched_api = url
            break

    # Step 2: Use World Bank API if match
    if matched_api:
        try:
            r = requests.get(matched_api)
            if r.status_code != 200 or not r.content:
                return {"error": "World Bank API returned no data"}

            json_data = r.json()
            if len(json_data) < 2:
                return {"error": "World Bank data format is invalid"}

            raw_data = json_data[1]
            processed_data = [
                {"year": str(d["date"]), "value": float(d["value"])}
                for d in raw_data if d.get("value") is not None
            ]

            return {
                "data": processed_data[::-1],
                "endpoint": matched_api
            }

        except Exception as e:
            return {"error": f"World Bank API error: {str(e)}"}

    # Step 3: Fallback to Gemini (Table or Chart Based on Prompt)
    try:
        model = genai.GenerativeModel("gemini-1.5-pro")

        # Check if this prompt should return table format
        table_keywords = ["expense", "expenses", "budget", "payslip", "salary", "invoice"]
        is_table = any(word in prompt_lower for word in table_keywords)

        if is_table:
            chart_prompt = f"""
User asked: '{prompt}'

Return only a JSON array for a table showing categories and values.
Example:
[
  {{"Category": "Rent", "Amount": 1200}},
  {{"Category": "Groceries", "Amount": 450}},
  ...
]

Only return raw JSON. No markdown. No explanation.
"""
        else:
            chart_prompt = f"""
User request: '{prompt}'

Return a JSON array that could be visualized as a pie or line chart.

Use one of:
[
  {{"label": "Category", "value": 100}}, ...
]
or
[
  {{"year": "2020", "value": 75}}, ...
]

Return only valid JSON.
"""

        response = model.generate_content(chart_prompt)
        raw_text = response.text.strip("```json").strip("```")

        data = json.loads(raw_text)
        return {"data": data, "endpoint": "Gemini"}

    except Exception as e:
        return {"error": f"Gemini fallback failed: {str(e)}"}

