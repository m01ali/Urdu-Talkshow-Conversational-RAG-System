from django.db import models
from django.contrib.auth.models import User

class Chatbots(models.Model):
    name = models.CharField(max_length=255, unique=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    title = models.CharField(max_length=255, default="")
    publish_date = models.DateTimeField(null=True, blank=True)
    date_created = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name

class Documents(models.Model):
    documentname = models.TextField()
    chatbot = models.ForeignKey(Chatbots, on_delete=models.CASCADE)
    date_created = models.DateTimeField(auto_now_add=True)
    page_content = models.TextField(default="")
    
    class Meta:
        unique_together = ('documentname', 'chatbot')
        
    def __str__(self):
        return self.documentname