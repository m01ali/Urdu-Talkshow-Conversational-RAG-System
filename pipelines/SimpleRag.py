from langchain.text_splitter import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import Chroma
from langchain import hub
from langchain_core.output_parsers import StrOutputParser
from langchain_core.runnables import RunnablePassthrough
from langchain_openai import AzureOpenAIEmbeddings
from utils.config import config_embeddings, models
from langchain_groq import ChatGroq
import os
from langchain_openai import OpenAIEmbeddings
from dotenv import load_dotenv
from langchain.chains import create_history_aware_retriever, create_retrieval_chain
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_community.chat_message_histories import ChatMessageHistory
from langchain_core.chat_history import BaseChatMessageHistory
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_core.runnables.history import RunnableWithMessageHistory
from django.conf import settings
from langchain_core.runnables import ConfigurableFieldSpec

from langchain_core.documents import Document
import pypdfium2 as pdfium

from langchain_community.embeddings.sentence_transformer import (
    SentenceTransformerEmbeddings,
)
import uuid

from utils.connection import Connection

# os.environ["OPENAI_API_KEY"] = ""

load_dotenv()


class SaveEmbeddingsPipeline:

    def __init__(self):
        try:
            self.client = Connection.get_chromadb_connection()
            if not self.client:
                raise Exception("Failed to connect to ChromaDB")
        except Exception as e:
            raise Exception(f"Failed to connect to ChromaDB: {e}")
    

    def chuking(self, document):

        name = document.name

        pdf = pdfium.PdfDocument(document)

        text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=800,
            chunk_overlap=100,
            length_function=len,
            separators=["\n\n", "\n", " ", ""],
        )

        docs = []
        for x in range(len(pdf)):
            content = pdf[x].get_textpage().get_text_range()
            metadata = {"page": x + 1, "documentname": name}
            doc = Document(page_content=content, metadata=metadata)
            docs.append(doc)

        splitted_text = text_splitter.split_documents(docs)

        return splitted_text

    def get_vector_store(self, collectionname):
        
        # embedding_function = AzureOpenAIEmbeddings(
        #         openai_api_key=os.environ.get("OPENAI_AZURE_API_KEY"),
        #         azure_endpoint=config_embeddings["text-embedding-3-large"]["endpoint"],
        #         deployment=config_embeddings["text-embedding-3-large"]["model_name"],
        #         openai_api_type="azure",
        # )
        
        try:
            vector_store = Chroma(
                client=self.client,
                collection_name=collectionname,
                embedding_function=OpenAIEmbeddings(),
            )
            
            return vector_store

        except Exception as e:
            print(f"ChromaDB connection error: {e}, resetting connection.")
            Connection.reset_connection()
            raise Exception(f"Failed to connect to ChromaDB: {e}")
        
      

    
    def save_embeddings(self, docs, chatbotname):
        splitted_text = self.chuking(docs)
        vector_store = self.get_vector_store(chatbotname)
        vector_store.add_documents(splitted_text)
        

    def delete_collection(self, colletionname):
        vector_store = self.get_vector_store(colletionname)
        vector_store.delete_collection()

    def delete_embeddings(self, colletionname, documentname):
        client = self.client
        collection = client.get_collection(colletionname)
        collection.delete(where={"documentname": documentname})


    def get_retriever(self, collectionname):
        vecotr_store = self.get_vector_store(collectionname)
        retriever = vecotr_store.as_retriever(
            search_type="similarity", search_kwargs={"k":5}
        )
        return retriever
    

    def get_llm(self):
        llm = ChatGroq(
            temperature=0,
            groq_api_key=os.environ["GROQ_API_KEY"],
            model_name=models["GROQ"]["model_name2"],
        )
        return llm


    def save_embeddings_pipeline(self, docs, collectionname):
        self.save_embeddings(docs, collectionname)
        return


    def generate_history_chat_response(self, query, collectionname, request):
        retriever = self.get_retriever(collectionname)
        llm = self.get_llm()

        contextualize_q_system_prompt =  """Given a chat history and the latest user question \
        which might reference context in the chat history, formulate a standalone question \
        which can be understood without the chat history. Do NOT answer the question, \
        just reformulate it if needed and otherwise return it as is. \
        You must Make sure that reformulated query is in URDU"""
        
        contextualize_q_prompt = ChatPromptTemplate.from_messages(
            [
                ("system", contextualize_q_system_prompt),
                MessagesPlaceholder("chat_history"),
                ("human", "{input}"),
            ]
        )
        history_aware_retriever = create_history_aware_retriever(
            llm, retriever, contextualize_q_prompt
        )
        
        
        qa_system_prompt2 = """You are an assistant for question-answering in URDU.\
        You are given context of a conversation Between Two People in URDU.\
        Use the following pieces of context to answer the user question about the URDU conversation.\
        If the Context don't provide the answer, just tell that the context don't have the answer.\
        You must Only speak URDU.\
        {context}"""
        
        
   
        
        qa_prompt = ChatPromptTemplate.from_messages(
            [
                ("system", qa_system_prompt2),
                MessagesPlaceholder("chat_history"),
                ("human", "{input}"),
            ]
        )
        question_answer_chain = create_stuff_documents_chain(llm, qa_prompt)

        rag_chain = create_retrieval_chain(
            history_aware_retriever, question_answer_chain
        )

        def get_session_history(
            session_id: str, chatbot_name: str
        ) -> BaseChatMessageHistory:
            key = f"{session_id}_{chatbot_name}"
            if key not in settings.SIMPLE_STORE:
                settings.SIMPLE_STORE[key] = ChatMessageHistory()

            return settings.SIMPLE_STORE[key]

        conversational_rag_chain = RunnableWithMessageHistory(
            rag_chain,
            get_session_history,
            input_messages_key="input",
            history_messages_key="chat_history",
            output_messages_key="answer",
            history_factory_config=[
                ConfigurableFieldSpec(
                    id="session_id",
                    annotation=str,
                    name="Session ID",
                    description="Unique identifier for the user session",
                    default="",
                    is_shared=True,
                ),
                ConfigurableFieldSpec(
                    id="chatbot_name",
                    annotation=str,
                    name="Chatbot Name",
                    description="Unique identifier of chatbot User is Using",
                    default="",
                    is_shared=True,
                ),
            ],
        )

        result = conversational_rag_chain.invoke(
            {"input": query},
            config={
                "configurable": {
                    "session_id": request.session.session_key,
                    "chatbot_name": collectionname,
                }
            },
        )["answer"]

        return result