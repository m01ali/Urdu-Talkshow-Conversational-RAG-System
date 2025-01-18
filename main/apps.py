from django.apps import AppConfig
from utils.connection import Connection

class MainConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'main'
    client = None

    def ready(self):
        Connection.get_chromadb_connection()
        
