# AI Engine Microservice

This is the AI Engine microservice for the Au5 project. It provides AI-based APIs using FastAPI and LangChain.

## How to Run

1. **Create a Virtual Environment:**
   ```bash
   python -m venv venv
   ```

2. **Activate the Virtual Environment:**
   - On Windows:
     ```bash
     .\venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```

3. **Install Dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the Application:**
   ```bash
   uvicorn app.main:app --reload
   ```

## Setting Up Environment Variables

1. **Create a `.env` File:**
   Copy the `.env.example` file to a new file named `.env`:
   ```bash
   cp .env.example .env
   ```

2. **Update the `.env` File:**
   Replace the placeholder values in the `.env` file with your actual configuration values, such as your OpenAI API key and URL.

## API Documentation

The AI Engine microservice includes Swagger-based API documentation. You can access it at the following endpoint after starting the application:

- **Swagger UI**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

This documentation provides an interactive interface to explore and test the available endpoints.