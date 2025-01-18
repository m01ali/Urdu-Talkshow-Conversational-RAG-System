from rest_framework.permissions import IsAuthenticated, AllowAny

from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes

from main.models import Chatbots
from pipelines.SimpleRag import SaveEmbeddingsPipeline
from main.serializers import ChatbotSerializer, SimpleChatbotSerializer
from django.contrib.auth.models import User

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def create_chatbot(request):

    if request.method == "POST":

        chatbot_name = request.data.get("chatbotname")
        username = request.user
        
        if Chatbots.objects.filter(name=chatbot_name).exists():
            return Response(
                {"success": False, "message": "Chatbot already exists."},
                status=status.HTTP_400_BAD_REQUEST,
            )
            
        title = request.data.get("title")
        publish_date = request.data.get("publishdate")

        user = User.objects.get(username=username)
        chatbot = Chatbots.objects.create(name=chatbot_name, user=user , title=title, publish_date=publish_date)
        serializer = ChatbotSerializer(chatbot)

        if chatbot:
            return Response(
                {
                    "success": True,
                    "message": "Chatbot created successfully.",
                    "data": serializer.data,
                },
                status=201,
            )
        else:
            return Response(
                {"success": False, "message": "Failed to create chatbot."},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    return Response(
        {"success": False, "message": "Only POST method is allowed."}, status=405
    )
    

@api_view(["POST"])
@permission_classes([IsAuthenticated])
def deletechatbot(request, chatbotname):

    try:
        chatbot = Chatbots.objects.get(name=chatbotname)
    except Chatbots.DoesNotExist:
        return Response(
            {"message": "Chatbot not found"}, status=status.HTTP_404_NOT_FOUND
        )

    botname = request.data.get("chatbotname")
    if botname != chatbotname:
        return Response(
            {"message": "Chatbot name mismatch"}, status=status.HTTP_400_BAD_REQUEST
        )

    if chatbot.user != request.user:
        return Response(
            {"message": "Not authorized for this chatbot"},
            status=status.HTTP_404_NOT_FOUND,
        )

    try:
        pipeline = SaveEmbeddingsPipeline()
        pipeline.delete_collection(chatbotname)
        chatbot.delete()
    except:
        return Response(
            {"message": "Error in deleting chatbot"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return Response(
        {"message": "Chatbot deleted successfully"}, status=status.HTTP_200_OK
    )



@api_view(["GET"])
def get_chatbot(request , chatbotname):
    try:
        chatbot = Chatbots.objects.get(name=chatbotname)
        serializer = ChatbotSerializer(chatbot)
        return Response({"success": True, "data": serializer.data})
    except Chatbots.DoesNotExist:
        return Response(
            {"success": False, "message": "Chatbot does not exist."},
            status=status.HTTP_404_NOT_FOUND,
        )



@api_view(["GET"])
def all_chatbots(request):
    try:
        if request.method == "GET":
            chatbots = Chatbots.objects.all()
            serializer = SimpleChatbotSerializer(chatbots, many=True)
            return Response({"success": True, "data": serializer.data})
        return Response(
            {"success": False, "message": "Only GET method is allowed."},
            status=status.HTTP_405_METHOD_NOT_ALLOWED,
        )
    except Exception as e:

        return Response({"error": e.args[0]}, status=status.HTTP_400_BAD_REQUEST)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def chatbots_by_user(request):
    if request.method == "GET":
        try:
            username = request.user
            user = User.objects.get(username=username)
            chatbots = Chatbots.objects.filter(user=user)
            serializer = SimpleChatbotSerializer(chatbots, many=True)
            return Response({"success": True, "data": serializer.data})
        except User.DoesNotExist:
            return Response(
                {"success": False, "message": "User does not exist."},
                status=status.HTTP_404_NOT_FOUND,
            )
    return Response(
        {"success": False, "message": "Only GET method is allowed."},
        status=status.HTTP_405_METHOD_NOT_ALLOWED,
    )