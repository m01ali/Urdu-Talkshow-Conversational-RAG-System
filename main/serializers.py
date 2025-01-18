from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Chatbots, Documents
from rest_framework.authtoken.models import Token


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["id", "username"]  # You can include other fields if needed


class SimpleChatbotSerializer(serializers.ModelSerializer):
    class Meta:
        model = Chatbots
        fields = ["id", "name", "title", "date_created" , "publish_date"]
        

class DocumentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Documents
        fields = ["id", "documentname", "page_content", "date_created"]


class ChatbotSerializer(serializers.ModelSerializer):
    user_details = UserSerializer(source="user", read_only=True)
    documents = DocumentSerializer(source='documents_set', many=True)

    class Meta:
        model = Chatbots
        fields = ["id", "name", "user", "title" , "user_details", "publish_date" , "date_created", "documents"]

class TokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = Token
        fields = ("key",)
