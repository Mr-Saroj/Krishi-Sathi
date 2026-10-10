from src.data_loader import load_all_documents
from src.embedding import EmbeddingPipeline
from src.vectorstore import FaissVectorStore
from src.search import RAGSearch


##Example usage
if __name__ == "__main__":
    # docs=load_all_documents("data")
    store=FaissVectorStore("faiss_store")
    # store.build_from_documents(docs)
    store.load()
    # print(store.query("What is AI?",top_k=3))
    
    reg_search=RAGSearch()
    query="How to protect tomato plant if it has disease Late Blight?"
    summary=reg_search.search_and_summarize(query,top_k=3)
    print("Summary: ",summary)
    
    
   
