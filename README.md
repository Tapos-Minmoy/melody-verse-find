
# MelodyVerse - Multilingual Song Recommendation System

MelodyVerse is a React-based web application that recommends songs in Bangla and Hindi based on user chat input.

## Project Structure

### Frontend (Current Repository)

This repository contains the React frontend for MelodyVerse with the following structure:

- `src/components/`: UI components including Chat interface and Song cards
- `src/lib/`: Utility functions and API client
- `src/pages/`: Application pages
- `public/`: Static assets

### Backend Implementation Requirements

The backend for this project should be implemented separately using:

- **Tech Stack**:
  - Python 3.10+ 
  - FastAPI
  - Uvicorn
  - Sentence-transformers (model: "l3cube-pune/indic-sentence-similarity-sbert")
  - Elasticsearch or Pinecone for vector database

- **Data Sources**:
  - Bangla: BanglaMusicStylo (GitHub)
  - Hindi: SangeetLyrics API (RapidAPI) and Genius API

- **API Endpoint**:
  The backend should expose a POST endpoint at `/api/recommend` that accepts:
  ```json
  {
    "chat": "<user message in Bangla or Hindi>"
  }
  ```
  
  And returns an array of song objects:
  ```json
  [
    {
      "id": "song_id",
      "title": "Song Title",
      "artist": "Artist Name",
      "snippet": "Matching lyric snippet",
      "play_url": "URL to play the song"
    }
  ]
  ```

## Backend Implementation Steps

1. **Data Ingestion**
   - Download and process BanglaMusicStylo dataset
   - Fetch Hindi lyrics from SangeetLyrics and Genius APIs
   - Store song metadata in a structured format

2. **Preprocessing**
   - Normalize Unicode text
   - Tokenize using indic-nlp-library
   - Clean text by removing markers and punctuation

3. **Embedding & Indexing**
   - Compute embeddings for each song and stanza
   - Index in Elasticsearch or Pinecone

4. **Retrieval Logic**
   - Implement vector similarity search
   - Rank results by relevance
   - Return top 5 matches

## Deployment

1. **Frontend**: Currently hosted on [deployment URL]
2. **Backend**: Should be deployed separately and the API URL updated in `src/lib/api.ts`

## Local Development

1. Clone this repository
2. Install dependencies: `npm install`
3. Start development server: `npm run dev`
4. Access the app at: http://localhost:5173/

## Backend Integration

Once the backend is deployed, update the API URL in `src/lib/api.ts` to point to your deployed FastAPI service.
