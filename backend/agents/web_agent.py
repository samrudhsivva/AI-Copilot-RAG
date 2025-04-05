import requests
import google.generativeai as genai

# 🌐 Function 1: Handles data-based visual prompts
def handle_prompt(prompt):
    try:
        if "gdp" in prompt.lower():
            url = "https://api.worldbank.org/v2/country/WLD/indicator/NY.GDP.MKTP.KD.ZG?format=json&per_page=500"
        elif "co2" in prompt.lower():
            url = "https://api.worldbank.org/v2/country/WLD/indicator/EN.GHG.CO2.AG.MT.CE.AR5?format=json&per_page=500"
        elif "agri" in prompt.lower():
            url = "https://api.worldbank.org/v2/country/WLD/indicator/AG.LND.AGRI.ZS?format=json&per_page=500"
        elif "milk" in prompt.lower():
            url = "https://api.stlouisfed.org/fred/series/observations?series_id=APU0000709112&api_key=YOUR_FRED_API_KEY&file_type=json"
        else:
            return {"data": [], "endpoint": "", "error": "Unsupported prompt"}

        response = requests.get(url).json()

        if not isinstance(response, list) or len(response) < 2 or not response[1]:
            return {
                "data": [],
                "endpoint": url,
                "error": f"No data found in API response: {response}"
            }

        data = response[1]
        formatted = [{"year": d["date"], "value": d["value"]} for d in data if d["value"] is not None]

        return {"data": formatted, "endpoint": url}

    except Exception as e:
        return {"data": [], "endpoint": "", "error": str(e)}


# 💬 Function 2: Handles general queries with Gemini
async def web_query(prompt: str):
    genai.configure(api_key="AIzaSyDnHim4Gpw1yIIobICu_yA4DXT3hE-bLSo")  # replace with env var in production
    model = genai.GenerativeModel("gemini-1.5-pro")
    response = model.generate_content(prompt)
    return {"agent": "WebUI", "response": response.text}
