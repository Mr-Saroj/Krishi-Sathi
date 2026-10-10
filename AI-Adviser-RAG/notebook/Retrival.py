# ============================================================
# RAG RETRIEVAL PIPELINE
# ============================================================

# import chromadb
# from sentence_transformers import SentenceTransformer


# ============================================================
# 1. EMBEDDING MODEL
# ============================================================

# class QueryEmbeddingManager:
#     """Generate embeddings for user queries."""

#     def __init__(
#         self,
#         model_name="all-MiniLM-L6-v2"
#     ):
#         self.model_name = model_name

#         print(
#             f"Loading embedding model: "
#             f"{self.model_name}"
#         )

#         self.model = SentenceTransformer(
#             self.model_name
#         )

#         print(
#             f"Embedding dimension: "
#             f"{self.model.get_embedding_dimension()}"
#         )

#     def generate_query_embedding(self, query):
#         """Convert user question into an embedding."""

#         embedding = self.model.encode(
#             query
#         )

#         return embedding.tolist()


# # ============================================================
# # 2. VECTOR STORE
# # ============================================================

# class Retriever:
#     """Retrieve relevant documents from ChromaDB."""

#     def __init__(
#         self,
#         persist_directory="data/vector_store",
#         collection_name="pdf_document"
#     ):

#         self.persist_directory = persist_directory
#         self.collection_name = collection_name

#         # Connect to existing ChromaDB
#         self.client = chromadb.PersistentClient(
#             path=self.persist_directory
#         )

#         # Get existing collection
#         self.collection = (
#             self.client.get_collection(
#                 name=self.collection_name
#             )
#         )

#         print(
#             f"\nConnected to collection: "
#             f"{self.collection_name}"
#         )

#         print(
#             f"Total documents in collection: "
#             f"{self.collection.count()}"
#         )

    # --------------------------------------------------------
    # Retrieve documents
    # --------------------------------------------------------

#     def retrieve(
#         self,
#         query,
#         top_k=3
#     ):
#         """
#         Retrieve the most relevant documents
#         for a user query.
#         """

#         print(
#             f"\nSearching for: "
#             f"{query}"
#         )

#         # --------------------------------------------
#         # Convert query into embedding
#         # --------------------------------------------

#         query_embedding = (
#             query_embedding_manager
#             .generate_query_embedding(query)
#         )

#         # --------------------------------------------
#         # Search ChromaDB
#         # --------------------------------------------

#         results = self.collection.query(
#             query_embeddings=[
#                 query_embedding
#             ],
#             n_results=top_k
#         )

#         return results

#     # --------------------------------------------------------
#     # Display results
#     # --------------------------------------------------------

#     def display_results(
#         self,
#         results
#     ):
#         """Display retrieved documents."""

#         documents = results["documents"][0]

#         metadatas = results["metadatas"][0]

#         distances = results["distances"][0]

#         print(
#             "\n======================================"
#         )

#         print(
#             "RETRIEVED DOCUMENTS"
#         )

#         print(
#             "======================================"
#         )

#         for i, (
#             document,
#             metadata,
#             distance
#         ) in enumerate(
#             zip(
#                 documents,
#                 metadatas,
#                 distances
#             )
#         ):

#             print(
#                 f"\n----- Result {i + 1} -----"
#             )

#             print(
#                 f"Distance: {distance}"
#             )

#             print(
#                 f"Source: "
#                 f"{metadata.get('source_file')}"
#             )

#             print(
#                 f"Page: "
#                 f"{metadata.get('page')}"
#             )

#             print(
#                 f"\nContent:\n"
#                 f"{document}"
#             )


# # ============================================================
# # 3. CREATE QUERY EMBEDDING MANAGER
# # ============================================================

# query_embedding_manager = (
#     QueryEmbeddingManager()
# )


# # ============================================================
# # 4. CREATE RETRIEVER
# # ============================================================

# retriever = Retriever()


# # ============================================================
# # 5. ASK QUESTION
# # ============================================================

# query = input(
#     "\nEnter your question: "
# )


# # ============================================================
# # 6. RETRIEVE RELEVANT DOCUMENTS
# # ============================================================

# results = retriever.retrieve(
#     query,
#     top_k=3
# )


# # ============================================================
# # 7. DISPLAY RESULTS
# # ============================================================

# retriever.display_results(
#     results
# )



#Retrival pipeline from VectorStore

