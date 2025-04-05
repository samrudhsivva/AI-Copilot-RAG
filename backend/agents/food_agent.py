from utils.rag_utils import get_rag_chain

async def food_query(prompt: str):
    qa = get_rag_chain("data/cd1254en.pdf")
    result = qa.run(prompt)
    return {"agent": "Food Security", "response": result}
