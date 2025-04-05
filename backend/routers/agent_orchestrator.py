from agents.web_agent import web_query
from agents.clinical_agent import clinical_query
from agents.food_agent import food_query

async def route_to_agent(prompt: str):
    lower = prompt.lower()

    # 🩺 Route to Clinical Agent
    clinical_keywords = ["ctg", "fetal", "heart", "contraction", "variability", "ecg", "pregnancy", "maternal", "monitoring", "gestational"]
    if any(word in lower for word in clinical_keywords):
        return await clinical_query(prompt)

    # 🌾 Route to Food Security Agent
    food_keywords = ["food","fertilizer", "nutrition", "agriculture", "malnutrition", "crop", "farmer", "yield"]
    if any(word in lower for word in food_keywords):
        return await food_query(prompt)

    # 🌐 Default to WebUI Agent
    return await web_query(prompt)
