from utils.rag_utils import get_rag_chain

async def clinical_query(prompt: str):
    qa = get_rag_chain("data/ctg-studies.pdf")
    result = qa.run(prompt)
    return {"agent": "Clinical", "response": result}
