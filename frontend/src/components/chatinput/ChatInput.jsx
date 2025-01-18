import "./chatinput.css";
import PropTypes from 'prop-types';

import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import { toast } from "sonner";

import sendicon from "@/assets/sendicon2.png"


function ChatInput({setInput , onSend , input , loading , sidebot}) {
  
    const handleChange = (e) => {
      setInput(e.target.value);
    };

    const handleonClick = () =>{
      console.log(input);
      console.log(loading);
      if(input === "") return
      if(input.trim() === "") {
        setInput("");
        return
      }

      if(input.length > 700) {
        toast.error("Message is too long. Limit 700 Chars");
        return
      }

      onSend();
    }

    return (
      <div className= {sidebot ? "smallChatInput" : "chatinput"} >
        

        <textarea placeholder=" ... اپنا سوال یہاں لکھیں"
            onChange={handleChange}  
            value={input}
        ></textarea>
        
        <Button onClick={handleonClick} disabled={loading}>
            {loading ? 
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                : <img src={sendicon} alt="send" className="h-6 w-6 mr-2" />
            }
        </Button>

      </div>
    )
}

ChatInput.propTypes = {
    setInput: PropTypes.func.isRequired,
    input: PropTypes.string.isRequired,
    onSend: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
    sidebot: PropTypes.bool
}

ChatInput.defaultProps = {
  sidebot: false
};
  
export default ChatInput
  