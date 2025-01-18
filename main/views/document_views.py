from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import status
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from main.models import Chatbots, Documents
from utils.utils import extract_text_from_pdf
from pipelines.SimpleRag import SaveEmbeddingsPipeline
from main.serializers import DocumentSerializer


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def adddocument(request, chatbotname):
    try:
        try:
            chatbot = Chatbots.objects.get(name=chatbotname)
        except Chatbots.DoesNotExist:
            return Response(
                {"message": "Chatbot not found"}, status=status.HTTP_404_NOT_FOUND
            )

        if chatbot.user != request.user:
            return Response(
                {"message": "Not Authorized for this Chatbot"},
                status=status.HTTP_404_NOT_FOUND,
            )

        docs = request.FILES.get("docs")

        if not docs:
            return Response(
                {"message": "No file uploaded"}, status=status.HTTP_400_BAD_REQUEST
            )

        try:
            new_docs = Documents.objects.create(documentname=docs.name, chatbot=chatbot)
            pass
        except Exception as E:
            return Response(
                {"message": "Same Document is Already Present"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
            
        try:
            print("Extracting Text from PDF")
            text = extract_text_from_pdf(docs)
            new_docs.page_content = text
            new_docs.save()
        except Exception as e:
            print(e.args[0])
            new_docs.delete()
            return Response(
                {"message": "Error in extracting text from PDF"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        try:
            print("Saving Embeddings")
            pipeline = SaveEmbeddingsPipeline()
            pipeline.save_embeddings_pipeline(docs, chatbotname)
        except Exception as e:
            print(e.args[0])
            new_docs.delete()
            return Response(
                {"message": "Error in saving embeddings"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        serializer = DocumentSerializer(new_docs)

        return Response(
            {"message": "Embeddings saved successfully", "data": serializer.data},
            status=status.HTTP_201_CREATED,
        )

    except Exception as e:
        print(e.args[0])
        return Response(
            {"message": e.args[0]}, status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def getdocumentsname(request, chatbotname):

    try:
        chatbot = Chatbots.objects.get(name=chatbotname)
    except Chatbots.DoesNotExist:
        return Response(
            {"message": "Chatbot not found"}, status=status.HTTP_404_NOT_FOUND
        )

    if chatbot.user != request.user:
        return Response(
            {"message": "Not authorized for this chatbot"},
            status=status.HTTP_404_NOT_FOUND,
        )

    docs = Documents.objects.filter(chatbot=chatbot)
    serializer = DocumentSerializer(docs, many=True)

    return Response(
        {"message": "Documents fetched successfully", "data": serializer.data},
        status=status.HTTP_200_OK,
    )


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def deletedocument(request, chatbotname):

    try:
        chatbot = Chatbots.objects.get(name=chatbotname)
    except Chatbots.DoesNotExist:
        return Response(
            {"message": "Chatbot not found"}, status=status.HTTP_404_NOT_FOUND
        )

    if chatbot.user != request.user:
        return Response(
            {"message": "Not authorized for this chatbot"},
            status=status.HTTP_404_NOT_FOUND,
        )

    documentname = request.data.get("documentname")

    try:
        document = Documents.objects.get(documentname=documentname, chatbot=chatbot)
    except Documents.DoesNotExist:
        return Response(
            {"message": "Document not found"}, status=status.HTTP_404_NOT_FOUND
        )

    try:
        pipeline = SaveEmbeddingsPipeline()
        pipeline.delete_embeddings(chatbotname, documentname)

        document.delete()
    except:
        return Response(
            {"message": "Error in deleting Document"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR,
        )

    return Response(
        {"message": "Document deleted successfully"}, status=status.HTTP_200_OK
    )