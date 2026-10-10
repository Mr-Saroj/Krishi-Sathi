import os
from dotenv import load_dotenv
from src.vectorstore import FaissVectorStore
from langchain_groq import ChatGroq

load_dotenv()

class RAGSearch:
    def __init__(self,persist_dir:str="faiss_store",embedding_model: str = "all-MiniLM-L6-v2",chunk_size:int=1000,chunk_overlap: int = 200):
        self.vectorestore=FaissVectorStore(persist_dir,embedding_model)
        
        #Load or build vector store
        faiss_path=os.path.join(persist_dir,"faiss.index")
        meta_path=os.path.join(persist_dir,"metadata.pkl")
        if not (os.path.exists(faiss_path) and os.path.exists(meta_path)):
            from src.data_loader import load_all_documents
            docs=load_all_documents("data")
            self.vectorestore.build_from_documents(docs)
        else:
            self.vectorestore.load()
        groq_api_key="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"
        llm_model = "openai/gpt-oss-20b"
        self.llm=ChatGroq(groq_api_key=groq_api_key, model_name=llm_model)
        print(f"[INFO] Groq LLM initialized: {llm_model}")
        
    def search_and_summarize(self, query: str, top_k:int =5)->str:
        results=self.vectorestore.query(query,top_k=top_k)
        texts=[r["metadata"].get("text","") for r in results if r["metadata"]]
        context="\n\n".join(texts)
        if not context:
            return "No relevant documents found."
        prompt = f"""Summarize the following context for the query: '{query}Context:{context}
        Please provide a concise and accurate answer based only on the context above."""
        response=self.llm.invoke([prompt])
        return response.content