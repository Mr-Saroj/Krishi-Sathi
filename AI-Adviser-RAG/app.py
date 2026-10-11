from src.vectorstore import FaissVectorStore
from src.search import RAGSearch


if __name__ == "__main__":
    store = FaissVectorStore("faiss_store")
    store.load()

    rag_search = RAGSearch()

    query = "How to protect tomato plant if it has disease Early Blight?"

    print("\nSummary:\n")

    for chunk in rag_search.search_and_summarize(query, top_k=3):
        print(chunk, end="", flush=True)

    print("\n")
