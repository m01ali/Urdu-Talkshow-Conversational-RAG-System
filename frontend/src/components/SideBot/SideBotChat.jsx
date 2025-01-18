import ChatBox from "@/components/chatbox/ChatBox"
import API_BASE_URL from "@/config"

import { useState } from "react"

import { toast } from "sonner";


function SideBotChat() {

    const [ input , setInput] = useState("")
    const [ messages , setMessages] = useState([])
    const [ loading , setLoading] = useState(false);


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

        const response = await fetch(`${API_BASE_URL}/customerservicebot/chat/`, {
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
        <div className="px-2 h-full bg-slate-200 ">
          <ChatBox 
              setInput={setInput}
              messages={messages}
              input={input}
              onSend={sendMessage}
              loading={loading}
              sidebot={true}
          ></ChatBox>
        </div>
    )
  }
  
  export default SideBotChat
  