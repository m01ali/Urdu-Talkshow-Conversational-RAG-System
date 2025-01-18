import Message from "@/components/message/Message"
import ChatInput from "@/components/chatinput/ChatInput"

import PropTypes from 'prop-types';
 
import "./ChatBox.css"

function ChatBox({messages , setInput  , input, onSend , loading , sidebot}) {

    return (
    <>
      <div className="space-y-2">
        <div className={sidebot ? "sidemessagearea" : "messagearea"}>
            {messages.map((message , index) => (
                <Message key={index} text={message.text} user={message.user} sidebot={sidebot} />
            ))}
        </div>
        
        <ChatInput 
            setInput={setInput} 
            onSend={onSend}
            input={input}  
            loading={loading}
            sidebot={sidebot}
            />
     
      </div>
    </>
    )
}

ChatBox.propTypes = {
    messages: PropTypes.array.isRequired,
    input: PropTypes.string.isRequired,
    onSend: PropTypes.func.isRequired,
    setInput: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
    sidebot: PropTypes.bool
};

ChatBox.defaultProps = {
    sidebot: false
};

export default ChatBox
  