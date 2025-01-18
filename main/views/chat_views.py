from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes

from main.models import Chatbots
from pipelines.SimpleRag import SaveEmbeddingsPipeline

@permission_classes([AllowAny])
@api_view(["POST"])
def chat(request, chatbotname):

    if request.session.session_key is None:
        print("Creating session")
        request.session.create()

    query = request.data.get("query")

    try:
        chatbot = Chatbots.objects.get(name=chatbotname)
    except Chatbots.DoesNotExist:
        return Response(
            {"message": "Chatbot not found"}, status=status.HTTP_404_NOT_FOUND
        )

    try:
        pipeline = SaveEmbeddingsPipeline()
        response = pipeline.generate_history_chat_response(query, chatbotname, request)
    except Exception as e:
        print(e.args[0])
        return Response(
            {"message": "Something Went Wrong"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
        
    return Response({"response": response}, status=status.HTTP_200_OK)