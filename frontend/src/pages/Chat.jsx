import "./Page.css";

import ChatBox from "@/components/chatbox/ChatBox"
import API_BASE_URL from "@/config"

import { useState } from "react"
import { useParams } from 'react-router-dom';

import { toast } from "sonner";

import Title from "@/components/Title/Title";

import SideContent  from "@/components/SideContent/SideContent";



function Chat() {

    const [ input , setInput] = useState("")
    const [ messages , setMessages] = useState([])
    const { chatbotname } = useParams();
    const [ loading , setLoading] = useState(false);

    const [chatbotData, setChatbotData] = useState(null);


    const sendMessage = async () => {

        setMessages([...messages , {text: input , user: true}]);

        getResponse(input)
        .then((response) => {
          setMessages((prevMessages) => [...prevMessages, { text: response, user: false }]);
        })
        .catch((error) => {
          console.error('Error sending message:', error);
        });

        setInput("");
    }

    async function getResponse(query) {
      try {

        setLoading(true);

        const response = await fetch(`${API_BASE_URL}/${chatbotname}/chat/`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ query }),
          credentials: 'include'

        });
        

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || "Error in Sending Message");
        }
    
        const data = await response.json();
        console.log(data);
        
        return data.response;

      } catch (error) {
            console.error('Error in Sending Message:', error);
            toast.error(error || "Error in Sending Message");
        throw error; 

      } finally {
        setLoading(false);

      }

    }
    

    return (
      <div className="chatpage">
        
        <Title title={ chatbotData ? chatbotData.title : chatbotname}  />
        
        <div className="flex flex-row">

          <div className="px-2 md:px-2 lg:px-2 w-3/4">
            <ChatBox 
                setInput={setInput}
                messages={messages}
                input={input}
                onSend={sendMessage}
                loading={loading}
            ></ChatBox>
          </div>

          <div className="p-2 md:p-2 lg:p-2 w-1/4">
            <SideContent chatbotname={chatbotname} setChatbotData={setChatbotData} chatbotData={chatbotData}
            ></SideContent>
          </div>

        </div>
      </div>
    )
  }
  
  export default Chat
  