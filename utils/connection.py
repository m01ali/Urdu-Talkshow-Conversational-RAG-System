import chromadb
from main import globals

class Connection:
    client = globals.CHROMA_DB_CONNECTION

    @classmethod
    def get_chromadb_connection(cls):
        if cls.client is None:
            cls.client = cls._create_connection()
            globals.CHROMA_DB_CONNECTION = cls.client
        return cls.client

    @staticmethod
    def _create_connection():
        try:
            print("Connecting to ChromaDB ...")
            client = chromadb.HttpClient(host="localhost", port=8001)
            return client
        except Exception as e:
            print(f"Error connecting to ChromaDB: {e}")
            return None
        
    @classmethod
    def reset_connection(cls):
        cls.client = None
        globals.CHROMA_DB_CONNECTION = None
