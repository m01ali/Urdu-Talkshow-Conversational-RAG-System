import "./Page.css";

import ChatBox from "@/components/chatbox/ChatBox"
import API_BASE_URL from "@/config"

import { useState } from "react"

import { useParams } from 'react-router-dom';

import { toast } from "sonner";

import Title from "@/components/Title/Title";


function ChatAdvanced() {

    const [ input , setInput] = useState("")
    const [ messages , setMessages] = useState([])
    const { chatbotname } = useParams();
    const [ loading , setLoading] = useState(false);


    const sendMessage = () => {
      
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

        const response = await fetch(`${API_BASE_URL}/${chatbotname}/advance_chat/`, {
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
        <Title title={chatbotname} />
        <div className="px-4 md:px-10 lg:px-40">
          <ChatBox 
              setInput={setInput}
              messages={messages}
              input={input}
              onSend={sendMessage}
              loading={loading}
          ></ChatBox>
        </div>
      </div>
    )
  }
  
  export default ChatAdvanced
  