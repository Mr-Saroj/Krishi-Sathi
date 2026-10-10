from pathlib import Path
from typing import List, Any
from langchain_community.document_loaders import PyPDFLoader, TextLoader
from langchain_community.document_loaders import Docx2txtLoader
from langchain_community.document_loaders import UnstructuredExcelLoader
from langchain_community.document_loaders import JSONLoader

def load_all_documents(data_dir: str)->List[Any]:
    """
    Load all supported files from the data directory and convert to Langchain document structured
    Supported: PDF,TXT,CSV,EXCEL.WORD,JSON
    """
    
    #Use project root data folder
    data_path=Path(data_dir).resolve()
    print(f"[DEBUG] Data path: {data_path}")
    documents=[]
    
    #Pdf files
    pdf_files=list(data_path.glob('**/*.pdf'))
    print(f"[DEBUG] Found {len(pdf_files)} PDF files: {[str(f) for f in pdf_files]}")
    for pdf_files in pdf_files:
        print(f"[DEBUG] Loading PDF:{pdf_files}")
        try:
            loader=PyPDFLoader(str(pdf_files))
            loaded=loader.load()
            print(f"[DEBUG] Loaded {len(loaded)} PDF docs from {pdf_files}")
            documents.extend(loaded)
        except Exception as e:
            print(f"[ERROR] Faield to load PDF {pdf_files}:{e}")
    return documents

