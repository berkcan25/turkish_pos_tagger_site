# Turkish Morphological Analyzer

This project is a web-based tool for the morphological analysis of Turkish, using a `zemberek-python` backend and a vanilla JavaScript frontend.

## Features

  * **Real-time Analysis**: Provides morphological analysis as the user types.
  * **Color-Coded Morphemes**: Applies syntax highlighting to morpheme tags for readability.
  * **Theme Support**: Includes light and dark themes with preference saved in `localStorage`.
  * **Character Input**: Provides on-screen buttons for Turkish-specific characters (ç, ğ, ı, ö, ş, ü).

## Technology Stack

  * **Backend**: Python 3, FastAPI, `zemberek-python`
  * **Frontend**: HTML5, CSS3, JavaScript (ES6+)
  * **Server**: `uvicorn` (for backend)

# Screenshots

<img width="400" alt="image" src="https://github.com/user-attachments/assets/3dc55519-7dfd-4ca7-86e6-315435022446" />

<img width="400" alt="image" src="https://github.com/user-attachments/assets/bdd63a97-6ed1-4b08-b356-6bd1e014f295" />

<img width="400" alt="image" src="https://github.com/user-attachments/assets/d12bde58-592e-439a-baf1-1d55c1579dd6" />


## Setup and Installation

This project requires running a separate backend and frontend.

### 1\. Backend (FastAPI Server)

1.  **Create a virtual environment and activate it:**

    ```sh
    python -m venv venv
    source venv/bin/activate  # On Windows: venv\Scripts\activate
    ```

2.  **Install Python dependencies:**

    ```sh
    pip install "fastapi[all]" zemberek-python
    ```

3.  **Run the server:**

    ```sh
    uvicorn pos_tagger:app --reload
    ```

    The server will run on `http://localhost:8000`.

### 2\. Frontend (HTTP Server)

The frontend must be served via HTTP due to `fetch` API CORS requirements.

1.  Open a **new terminal** in the project directory.
2.  Use Python's built-in HTTP server:

    ```sh
    python -m http.server 8080
    ```
3.  Open your browser to `http://localhost:8080`.

## Usage

1.  Ensure both the backend (`uvicorn`) and frontend (`http.server`) are running in separate terminals.
2.  Open `http://localhost:8080` in your browser.
3.  Type a Turkish sentence into the input box to see the analysis.
4.  Hover over any morpheme to view its tag details in a tooltip.
5.  Words with a dashed underline are ambiguous. Click them to open a modal and select an alternative analysis.
