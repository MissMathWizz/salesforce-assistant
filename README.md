# 📊 Salesforce Earnings Call Assistant

An AI-powered assistant that helps analysts **quickly understand** Salesforce's quarterly earnings reports.  
The system uses **Retrieval-Augmented Generation (RAG)** to answer questions, summarize key insights, and highlight strategic trends — based on actual earnings presentation transcripts.

---

## 🔧 Tech Stack

- **Language Model:** Gemini (via Vertex AI / PaLM API)
- **Embedding Model:** `text-embedding-005`
- **Vector Store:** FAISS / Pinecone
- **Backend:** FastAPI (deployed via Cloud Run)
- **Frontend:** Built with [v0.dev](https://v0.dev)
- **Data Source:** Public Salesforce earnings call PDFs

---

## 📁 Project Structure

```bash
.
├── Front_end/                  # v0.dev frontend for user interaction
├── Cloud_run/                 # FastAPI backend, Docker setup, deployment files
├── data/
│   └── earnings_pdfs/         # Raw earnings transcripts (PDF format)
├── Data_process.ipynb         # Extracts real report name + date, embeds text and images
├── README.md                  # You're here!

## Architecture Diagram
![image](https://github.com/user-attachments/assets/300b49b6-dae8-4181-a7d8-b454d34bc716)

## Front end visual
![Screenshot 2025-04-13 at 10 58 52 p m](https://github.com/user-attachments/assets/b3947a34-eba8-4204-b317-da016573143a)

