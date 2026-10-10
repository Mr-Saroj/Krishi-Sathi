#Data ingestion

#Document  structure
from langchain_core.documents import Document
doc=Document(
    page_content="this is the main text content I am using to create RAG",
    metadata={
        "source":"example.txt",
        "pages":1,
        "author":"Saroj Ojha",
        "date_created":"2025-01-01"
    }
)

#Create a simple txt file
import os

# Create the folder if it doesn't exist
os.makedirs("data/text_files", exist_ok=True)


# -----------------------------
# 1. Python Introduction
# -----------------------------

python_content = """
Python Programming Introduction

Python is a high-level, interpreted, general-purpose programming language.

Python was created by Guido van Rossum and was first released in 1991.

Python is known for its simple and readable syntax, which makes it easy
for beginners to learn.

Python is widely used in many areas, including:

1. Web Development
2. Data Science
3. Machine Learning
4. Artificial Intelligence
5. Automation
6. Scientific Computing
7. Backend Development

A simple Python program looks like this:

print("Hello, World!")

Python uses indentation to define blocks of code.

For example:

if 10 > 5:
    print("10 is greater than 5")

Python supports different data types such as:

- int
- float
- string
- boolean
- list
- tuple
- set
- dictionary

Python also supports important programming concepts such as:

- Variables
- Conditions
- Loops
- Functions
- Classes
- Objects
- Exception Handling
- Modules

Because Python has a large number of libraries and frameworks,
it is widely used in modern software development and artificial intelligence.
"""


# -----------------------------
# 2. Machine Learning Basics
# -----------------------------

machine_learning_content = """
Machine Learning Basics

Machine Learning is a branch of Artificial Intelligence that allows
computers to learn patterns from data and make predictions or decisions
without being explicitly programmed for every situation.

Machine Learning works by providing data to an algorithm. The algorithm
learns patterns from the data and uses those patterns to make predictions
on new data.

For example, if we provide a machine learning model with information
about houses such as size, location, and number of rooms along with their
prices, the model can learn the relationship between these features and
house prices.

The three major types of Machine Learning are:

1. Supervised Learning
2. Unsupervised Learning
3. Reinforcement Learning

Supervised Learning:

In supervised learning, the model learns from labeled data.

For example:

Input:
House size = 1500 square feet

Output:
House price = 500000

Common supervised learning algorithms include:

- Linear Regression
- Logistic Regression
- Decision Tree
- Random Forest
- Support Vector Machine
- K-Nearest Neighbors

Unsupervised Learning:

In unsupervised learning, the data does not contain predefined labels.
The algorithm tries to discover patterns or groups in the data.

Common unsupervised learning algorithms include:

- K-Means Clustering
- Hierarchical Clustering
- Principal Component Analysis

Reinforcement Learning:

In reinforcement learning, an agent learns by interacting with an
environment.

The agent receives rewards for good actions and penalties for bad actions.
Over time, the agent learns a strategy that helps it maximize its reward.

Important Machine Learning concepts include:

- Dataset
- Features
- Labels
- Training Data
- Testing Data
- Model
- Training
- Prediction
- Accuracy
- Loss Function
- Optimization

A typical Machine Learning workflow is:

1. Collect Data
2. Clean Data
3. Prepare Data
4. Split Data into Training and Testing Sets
5. Select a Machine Learning Algorithm
6. Train the Model
7. Evaluate the Model
8. Make Predictions

Machine Learning is widely used in:

- Recommendation Systems
- Fraud Detection
- Image Recognition
- Speech Recognition
- Medical Diagnosis
- Spam Detection
- Price Prediction
- Natural Language Processing

Machine Learning is an important technology used in modern Artificial
Intelligence applications.
"""


# -----------------------------
# Create Python file
# -----------------------------

python_file = "data/text_files/python_intro.txt"

with open(python_file, "w", encoding="utf-8") as file:
    file.write(python_content)


# -----------------------------
# Create Machine Learning file
# -----------------------------

ml_file = "data/text_files/machine_learning.txt"

with open(ml_file, "w", encoding="utf-8") as file:
    file.write(machine_learning_content)


print("Files created successfully!")
print(python_file)
print(ml_file)

# Text Loader

from langchain_community.document_loaders import TextLoader

loader = TextLoader(
    "data/text_files/python_intro.txt",
    encoding="utf-8"
)

# document = loader.load()

# print(document)


# Directory Loader

from langchain_community.document_loaders import DirectoryLoader

# dir_loader = DirectoryLoader(
#     "data/text_files",
#     glob="**/*.txt",
#     loader_cls=TextLoader,
#     loader_kwargs={"encoding": "utf-8"},
#     show_progress=False
# )

# documents = dir_loader.load()

# print(documents)

from langchain_community.document_loaders import DirectoryLoader, PyMuPDFLoader

dir_loader = DirectoryLoader(
    "data/pdf",
    glob="**/*.pdf",
    loader_cls=PyMuPDFLoader,
    show_progress=False
)

pdf_documents = dir_loader.load()

print(pdf_documents)