import os
from dotenv import load_dotenv
from src.vectorstore import FaissVectorStore
from langchain_groq import ChatGroq
from collections.abc import Iterator

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
        groq_api_key = os.getenv("GROQ_API_KEY")
        llm_model = "openai/gpt-oss-20b"
        self.llm=ChatGroq(groq_api_key=groq_api_key, model_name=llm_model)
        print(f"[INFO] Groq LLM initialized: {llm_model}")
        
    def search_and_summarize(self, query: str, top_k:int =5)->str:
        results=self.vectorestore.query(query,top_k=top_k)
        texts = [
        r["metadata"].get("text", "")
        for r in results
        if r.get("metadata") and r["metadata"].get("text")
    ]
        context="\n\n".join(texts)
        if not context:
            return "No relevant documents found."
        prompt = f"""You are Krishi Sathi AI, a professional agricultural advisory assistant.

                     Your role is to provide clear, practical, evidence-based farming
                     recommendations using the retrieved agricultural documents.

                     FARMER'S QUESTION:
                     {query}

                     RETRIEVED AGRICULTURAL CONTEXT:
                     {context}

                    INSTRUCTIONS:

                   1. Start with a clear, relevant heading.
                   2. Briefly explain the crop problem or disease when relevant.
                   3. Present practical recommendations using numbered steps
                      with short, descriptive headings.
                   4. Explain each recommendation in simple, professional language.
                   5. Prioritize prevention, field hygiene, and cultural practices
                      before chemical treatments.
                   6. Use bullet points for important precautions.
                   7. Mention pesticides, dosages, application intervals, and
                      seed-treatment rates only when adequately supported by the
                      retrieved context and appropriate for the crop and location.
                   8. Never invent facts, pesticide doses, product registrations,
                      or treatment recommendations.
                   9. For pesticide use, advise farmers to follow the locally
                      applicable product label, safety precautions, and
                      pre-harvest interval.
                   10. If the retrieved context does not support a recommendation,
                       clearly acknowledge the limitation instead of guessing.
                   11. Do not repeat information or produce unnecessarily large tables.
                   12. End with a short summary or a useful follow-up question
                       when additional information would help.

                     OUTPUT FORMAT:

                      ## [Relevant Title]

                     [Brief overview of the problem]

                      ## Recommended Actions

                    1. **[Action heading]**
                    [Practical explanation]

                    2. **[Action heading]**
                     [Practical explanation]

                    ## Important Precautions

                   - [Relevant precaution]

                      ## Summary

                    [One or two sentences describing the key actions.]

                    IMPORTANT:
                    Use the retrieved context as your primary evidence.
                    Distinguish between information supported by the context and
                    general safety advice. Do not claim that an unsupported treatment
                    is scientifically established."""
        for chunk in self.llm.stream([prompt]):
            if isinstance(chunk.content, str) and chunk.content:
                yield chunk.content