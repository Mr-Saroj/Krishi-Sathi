# RAG Pipeline - Data Ingestion to Vector DB Pipeline

from pathlib import Path
import os
import uuid
from typing import List, Any, Dict

import numpy as np
import chromadb
from sentence_transformers import SentenceTransformer

from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter


# ============================================================
# 1. READ ALL PDF FILES
# ============================================================

def process_all_pdf(pdf_directory):
    """Process all PDF files in the directory."""

    all_documents = []

    pdf_dir = Path(pdf_directory)

    # Find all PDF files recursively
    pdf_files = list(pdf_dir.glob("**/*.pdf"))

    print(f"Found {len(pdf_files)} PDF files to process")

    # Process each PDF file
    for pdf_file in pdf_files:

        print(f"\nProcessing: {pdf_file.name}")

        try:
            # Create PDF loader
            loader = PyPDFLoader(str(pdf_file))

            # Load PDF pages
            documents = loader.load()

            # Add source information to metadata
            for doc in documents:
                doc.metadata["source_file"] = pdf_file.name
                doc.metadata["file_type"] = "pdf"

            # Add documents to the main list
            all_documents.extend(documents)

            print(f"Loaded {len(documents)} pages")

        except Exception as e:
            print(f"Error processing {pdf_file.name}: {e}")

    print(f"\nTotal documents loaded: {len(all_documents)}")

    return all_documents


# ============================================================
# 2. LOAD PDF DOCUMENTS
# ============================================================

all_pdf_documents = process_all_pdf("data/pdf")


# ============================================================
# 3. SPLIT DOCUMENTS INTO CHUNKS
# ============================================================

def split_documents(
    documents,
    chunk_size=1000,
    chunk_overlap=200
):
    """Split documents into smaller chunks for better RAG performance."""

    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=chunk_size,
        chunk_overlap=chunk_overlap,
        length_function=len,
        separators=[
            "\n\n",
            "\n",
            " ",
            ""
        ]
    )

    split_docs = text_splitter.split_documents(documents)

    print(
        f"Split {len(documents)} documents "
        f"into {len(split_docs)} chunks"
    )

    # Show example chunk
    if split_docs:

        print("\nExample chunk:")

        print(
            f"Content: "
            f"{split_docs[0].page_content[:200]}..."
        )

        print(
            f"Metadata: "
            f"{split_docs[0].metadata}"
        )

    return split_docs


# Create chunks
chunks = split_documents(all_pdf_documents)


# ============================================================
# 4. EMBEDDING MANAGER
# ============================================================

class EmbeddingManager:
    """Handles document embedding generation using SentenceTransformer."""

    def __init__(
        self,
        model_name: str = "all-MiniLM-L6-v2"
    ):

        self.model_name = model_name
        self.model = None

        self._load_model()

    # --------------------------------------------------------
    # Load embedding model
    # --------------------------------------------------------

    def _load_model(self):
        """Load the Sentence Transformer model."""

        try:

            print(
                f"\nLoading embedding model: "
                f"{self.model_name}"
            )

            self.model = SentenceTransformer(
                self.model_name
            )

            print(
                "Model loaded successfully."
            )

            print(
                f"Embedding dimension: "
                f"{self.model.get_embedding_dimension()}"
            )

        except Exception as e:

            print(
                f"Error loading model "
                f"{self.model_name}: {e}"
            )

            raise

    # --------------------------------------------------------
    # Generate embeddings
    # --------------------------------------------------------

    def generate_embedding(
        self,
        texts: List[str]
    ) -> np.ndarray:
        """
        Generate embeddings for a list of texts.

        Args:
            texts: List of text strings.

        Returns:
            NumPy array containing embeddings.
        """

        if self.model is None:
            raise ValueError(
                "Embedding model is not loaded"
            )

        print(
            f"\nGenerating embeddings for "
            f"{len(texts)} texts..."
        )

        embeddings = self.model.encode(
            texts,
            show_progress_bar=True
        )

        print(
            f"Generated embeddings with shape: "
            f"{embeddings.shape}"
        )

        return embeddings

    # --------------------------------------------------------
    # Get embedding dimension
    # --------------------------------------------------------

    def get_embedding_dimension(self) -> int:
        """Return the embedding dimension."""

        if self.model is None:
            raise ValueError(
                "Embedding model is not loaded"
            )

        return self.model.get_embedding_dimension()


# ============================================================
# 5. CREATE EMBEDDING MANAGER
# ============================================================

embedding_manager = EmbeddingManager()

print(
    f"\nEmbedding manager created: "
    f"{embedding_manager}"
)


# ============================================================
# 6. VECTOR STORE
# ============================================================

class VectorStore:
    """Manages document embeddings in ChromaDB."""

    def __init__(
        self,
        collection_name: str = "pdf_document",
        persist_directory: str = "data/vector_store"
    ):
        """
        Initialize the vector store.

        Args:
            collection_name:
                Name of the ChromaDB collection.

            persist_directory:
                Directory where ChromaDB data is stored.
        """

        self.collection_name = collection_name

        self.persist_directory = persist_directory

        self.client = None

        self.collection = None

        # Initialize ChromaDB
        self._initialize_store()

    # --------------------------------------------------------
    # Initialize ChromaDB
    # --------------------------------------------------------

    def _initialize_store(self):
        """Initialize ChromaDB client and collection."""

        try:

            # Create directory if it doesn't exist
            os.makedirs(
                self.persist_directory,
                exist_ok=True
            )

            # Create persistent ChromaDB client
            self.client = chromadb.PersistentClient(
                path=self.persist_directory
            )

            # Create or get collection
            self.collection = (
                self.client.get_or_create_collection(
                    name=self.collection_name,
                    metadata={
                        "description":
                        "PDF document embeddings for RAG"
                    }
                )
            )

            print(
                f"\nVector store initialized."
            )

            print(
                f"Collection: "
                f"{self.collection_name}"
            )

            print(
                f"Existing documents: "
                f"{self.collection.count()}"
            )

        except Exception as e:

            print(
                f"Error initializing vector store: "
                f"{e}"
            )

            raise

    # --------------------------------------------------------
    # Add documents
    # --------------------------------------------------------

    def add_documents(
        self,
        documents: List[Any],
        embeddings: np.ndarray
    ):
        """
        Add documents and their embeddings to ChromaDB.

        Args:
            documents:
                List of LangChain Document objects.

            embeddings:
                Corresponding NumPy embeddings.
        """

        # Make sure both lengths are equal
        if len(documents) != len(embeddings):

            raise ValueError(
                "Number of documents must match "
                "number of embeddings"
            )

        print(
            f"\nAdding {len(documents)} "
            f"documents to vector store..."
        )

        # Lists required by ChromaDB
        ids = []

        metadatas = []

        documents_text = []

        embeddings_list = []

        # ----------------------------------------------------
        # Process every document and its embedding
        # ----------------------------------------------------

        for i, (doc, embedding) in enumerate(
            zip(documents, embeddings)
        ):

            # -----------------------------------------------
            # Generate unique document ID
            # -----------------------------------------------

            doc_id = (
                f"doc_"
                f"{uuid.uuid4().hex[:8]}_"
                f"{i}"
            )

            ids.append(doc_id)

            # -----------------------------------------------
            # Prepare metadata
            # -----------------------------------------------

            # Copy original metadata
            metadata = dict(doc.metadata)

            # Add our custom metadata
            metadata["doc_index"] = i

            metadata["content_length"] = (
                len(doc.page_content)
            )

            # Add metadata dictionary to list
            metadatas.append(metadata)

            # -----------------------------------------------
            # Store document text
            # -----------------------------------------------

            documents_text.append(
                doc.page_content
            )

            # -----------------------------------------------
            # Store embedding
            # -----------------------------------------------

            embeddings_list.append(
                embedding.tolist()
            )

        # ----------------------------------------------------
        # Add everything to ChromaDB
        # ----------------------------------------------------

        try:

            self.collection.add(
                ids=ids,
                embeddings=embeddings_list,
                metadatas=metadatas,
                documents=documents_text
            )

            print(
                f"Successfully added "
                f"{len(documents)} documents "
                f"to vector store."
            )

            print(
                f"Total documents in collection: "
                f"{self.collection.count()}"
            )

        except Exception as e:

            print(
                f"Error adding documents "
                f"to vector store: {e}"
            )

            raise


# ============================================================
# 7. CREATE VECTOR STORE
# ============================================================

vector_store = VectorStore()


# ============================================================
# 8. CONVERT CHUNKS INTO TEXT
# ============================================================

print("\nPreparing text for embedding...")

texts = [
    doc.page_content
    for doc in chunks
]

print(
    f"Prepared {len(texts)} texts."
)


# ============================================================
# 9. GENERATE EMBEDDINGS
# ============================================================

embeddings = (
    embedding_manager.generate_embedding(
        texts
    )
)


# ============================================================
# 10. STORE DOCUMENTS + EMBEDDINGS IN CHROMADB
# ============================================================

vector_store.add_documents(
    chunks,
    embeddings
)


# ============================================================
# PIPELINE COMPLETED
# ============================================================

# print("\n======================================")
# print("RAG INGESTION PIPELINE COMPLETED")
# print("======================================")

# print(
#     f"PDF pages loaded: "
#     f"{len(all_pdf_documents)}"
# )

# print(
#     f"Chunks created: "
#     f"{len(chunks)}"
# )

# print(
#     f"Embeddings generated: "
#     f"{len(embeddings)}"
# )

# print(
#     f"Embedding dimension: "
#     f"{embeddings.shape[1]}"
# )

# print(
#     f"Vector database documents: "
#     f"{vector_store.collection.count()}"
# )


class RAGRetriever:
    """Hendels query-based retrival from the vector store"""
    
    def __init__(self,vector_store:VectorStore,embedding_manager:EmbeddingManager):
        """
        Initialize the retriver
        
        Args:
        vector_store:Vector store containing document embeddings
        embedding_manager:Manager for generating query embeddings
        """
        
        self.vector_store=vector_store
        self.embedding_manager=embedding_manager
        
    def retrieve(self, query: str, top_k: int = 5, score_threshold: float = 0.0) -> List[Dict[str, Any]]:
        print(f"Retriving documents for query: '{query}")
        print(f"Top k: {top_k}, Score threshold: {score_threshold}")
        
        #Generate query embedding
        query_embedding=self.embedding_manager.generate_embedding([query])[0]
        
        #Search in vector store
        try:
            results=self.vector_store.collection.query(
                query_embeddings=[query_embedding.tolist()],
                n_results=top_k
            )
            
            #process result
            retrieved_docs = []
            
            if results['documents'] and results['documents'][0]:
                documents = results['documents'][0]
                metadatas = results['metadatas'][0]
                distances = results['distances'][0]
                ids = results['ids'][0]
                
                for i, (doc_id,document,metadata,distance) in enumerate(zip(ids,documents,metadatas,distances)):
                    similarity_score=1-distance
                    
                    if similarity_score >= score_threshold:
                        retrieved_docs.append({
                            'id':doc_id,
                            'content':document,
                            'metadata':metadata,
                            'similarity_score':similarity_score,
                            'distance':distance,
                            'rank':i+1
                        })
                    print(f"Retrieved {len(retrieved_docs)} documents after filtering")
            else:
                print("No documents found")
                
            return retrieved_docs
        
        except Exception as e:
            print(f"Error during retrieval: {e}")
            return []
        
rag_retriver=RAGRetriever(vector_store,embedding_manager)

# rag_retriver.retrieve("What is Artificial intelligence ?")

#Integration vectordb context pipeline with LLM output

#Simple RAG pipeline with Groq LLM
from langchain_groq import ChatGroq
import os
from dotenv import load_dotenv
load_dotenv()

#Initialize the Groq LLM(set your GROQ_API_KEY in enviroment)
groq_api_key="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"

llm = ChatGroq(
    groq_api_key=groq_api_key,
    model_name="openai/gpt-oss-120b",  # Updated model ID
    temperature=0.1,
    max_tokens=1024
)

# Simple RAG function:retrive context + generated response
# def rag_simple(query,retriver,llm,top_k=3):
#     #Retrive the context
#     result = retriver.retrieve(query, top_k)
#     context="\n\n".join([doc['content'] for doc in result]) if result else ""
#     if not context:
#         return "No relevent context found to answer the question."
    
#     #Generate the answer using GROQ_LLM
#     prompt=f"""Use the following context to answer the question concisely.
#         Context:
#         {context}
#         Question:{query}
#         Answer:"""
        
#     respnse=llm.invoke([prompt.format(context=context,query=query)])
#     return respnse.content

# answer=rag_simple("What is Artificial intelligence",rag_retriver,llm)
# print(answer)

# #Enhanced RAG pipeline fetures
# def rag_advanced(query,retriver,llm,top_k=5,min_score=0.2,return_context=False):
#     """
#     RAG pipeline with extra features:
#     Returns answer , sources, confidence score, and optionally full context.
#     """
#     results = retriver.retrieve(query, top_k, score_threshold=min_score)
#     if not results:
#         return {'answer': 'No relevant context found.','sources': [],'confidence': 0.0,'context': ''}
    
#     #prepare context and sources
#     context="\n\n".join([doc['content'] for doc in results])
#     sources=[{
#         'source':doc['metadata'].get('source_file',doc['metadata'].get('source','unknown')),
#         'page':doc['metadata'].get('page','unknown'),
#         'score':doc['similarity_score'],
#         'preview':doc['content'][:120]+'...'
#     }for doc in results]
#     confidence=max([doc['similarity_score']for doc in results])
    
#     #Generate answer
#     prompt=f"""Use the following context to answer the question concisely.\nContext:/n{context}\n\nQuestion: {query}\n\nAnswer:"""
#     response=llm.invoke([prompt.format(context=context,query=query)])
    
#     output={
#         'answer':response.content,
#         'sources':sources,
#         'confidence':confidence
#     }
#     if return_context:
#         output['context']=context
#     return output

# #Example usage:
# result=rag_advanced("Why is AI Used?",rag_retriver,llm,top_k=3,min_score=0.1,return_context=True)
# print("Answer:",result['answer'])
# print("Sources:",result['sources'])
# print("Confidence:",result['confidence'])
# print("Context preview:",result['context'][:300])


#Advanced RAG Pipeline: Streaming,Citations, History, Summarization
from typing import List, Dict,Any
import time
class AdvancedRAGPipeline:
    def __init__(self,retriever,llm):
        self.retriever=retriever
        self.llm=llm
        self.history=[] #Store the query history
        
    def query(self, question: str, top_k: int = 5, min_score: float = 0.2, stream: bool = False, summerize: bool = False) -> Dict[str, Any]:
        #Retrive relevant documents
        results = self.retriever.retrieve(question, top_k, score_threshold=min_score)
        if not results:
            answer="No relevant content found."
            sources=[]
            context=""
        else:
            context="\n\n".join([doc['content']for doc in results])
            sources=[{
                'source':doc['metadata'].get('source_file',doc['metadata'].get('source','unknown')),
                'page':doc['metadata'].get('page','unknown'),
                'score':doc['similarity_score'],
                'preview':doc['content'][:120]+'...'
            }for doc in results]
            #Streaming answer simulation
            prompt=f"""Use the following context to answer the question conciesly:\n{context}\n\nQuestion:{question}\n\nAnswer:"""
            if stream:
                print("Streaming answer:")
                for i in range(0, len(prompt),80):
                    print(prompt[i:i+80],end='',flush=True)
                    time.sleep(0.05)
                print()
            response=self.llm.invoke([prompt.format(context=context,question=question)])
            answer=response.content
            
        #Add citation to answer
        citations=[f"[{i+1}] {src['source']} (page {src['page']})" for i, src in enumerate(sources)]
        answer_with_citations=answer+"\n\nCitations:\n"+"\n".join(citations) if citations else answer
        
        #Optionally summerize answer
        summary=None
        if summerize and answer:
            summary_prompt=f"Summerize following answer in 2 sentence:\n{answer}"
            summary_resp=self.llm.invoke([summary_prompt])
            summary=summary_resp.content
            
        #Store quesry history
        self.history.append({
            'question': question,
            'answer': answer,
            'sources': sources,
            'summary': summary
        })
        return{
            'question':question,
            'answer':answer_with_citations,
            'sources':sources,
            'summary':summary,
            'history':self.history
        }
        
#Example usage
adv_rag=AdvancedRAGPipeline(rag_retriver,llm)
result=adv_rag.query("What is AI?",top_k=3,min_score=0.3,stream=True,summerize=True)
print("\nFinal answer:",result['summary'])
print("Summary:",result['summary'])
print("Hostory:",result['history'][-1])

                    