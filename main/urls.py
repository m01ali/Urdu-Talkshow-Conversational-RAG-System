from django.urls import path
from .views import *
from django.contrib.auth.views import LogoutView

urlpatterns = [
    
    path("signup/", signup_api, name="signup"),
    path("login/", login_api, name="login"),
    path("logout/", logout_view, name="logout"),
    
    path("createchatbot/", create_chatbot, name="createChatbot"),
    
    path("<str:chatbotname>/adddocument/", adddocument),
    path("<str:chatbotname>/getdocuments/", getdocumentsname),
    path("<str:chatbotname>/deletedocument/", deletedocument),
    
    path("<str:chatbotname>/deletechatbot/", deletechatbot),
    
    path("<str:chatbotname>/chat/", chat),
    
    path("getallchatbots/", all_chatbots, name="getallChatbots"),
    path("chatbotbyuser/", chatbots_by_user, name="chatbotByUser"),
    
    path("<str:chatbotname>/getchatbotdata/" , get_chatbot, name="getChatbot"),    
    
]
