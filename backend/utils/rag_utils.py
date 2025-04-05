import google.generativeai as genai
from langchain_community.vectorstores import FAISS
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.document_loaders import PyPDFLoader
from langchain.chains import RetrievalQA
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_google_genai import ChatGoogleGenerativeAI

import os

# ✅ Set Gemini API Key here
genai.configure(api_key="AIzaSyDnHim4Gpw1yIIobICu_yA4DXT3hE-bLSo")  # 🔁 Replace with your key

def get_rag_chain(pdf_path):
    loader = PyPDFLoader(pdf_path)
    pages = loader.load_and_split()

    embeddings = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
    vectorstore = FAISS.from_documents(pages, embeddings)

    llm = ChatGoogleGenerativeAI(model="gemini-1.5-pro", google_api_key="AIzaSyDnHim4Gpw1yIIobICu_yA4DXT3hE-bLSo") # or "gemini-1.5-pro"
    retriever = vectorstore.as_retriever()

    qa = RetrievalQA.from_chain_type(llm=llm, retriever=retriever)
    return qa
