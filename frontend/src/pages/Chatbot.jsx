import "./Page.css"

import DocumentComponent from "@/components/Containers/DocumentComponent";
import Title from "@/components/Title/Title";
import DeleteChatbot from "@/components/Dailog/DeleteChatbot";
import ButtonContainer from "@/components/Containers/ButtonContainer";

import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button"

import { useParams } from 'react-router-dom';


const Chatbot = () => {

    const { chatbotname } = useParams();

    return (
        <div className="chatbotPage">
            
            <Title title={chatbotname} />

            <div className="px-4 md:px-10 lg:px-40 py-8 space-y-7" >

                <ButtonContainer title="Actions">
                    <div className="lg:space-x-5 lg:space-y-0 lg:block space-y-4 flex flex-col">
                        <Button asChild>
                            <Link to={`/chat/${chatbotname}`}>Start Chat</Link>
                        </Button>
                    </div>
                </ButtonContainer>
                  
                <DocumentComponent />

                <ButtonContainer title="Delete this Talk Show">
                    <DeleteChatbot chatbotname={chatbotname} />
                </ButtonContainer>

            </div>

        </div>
    );
};

export default Chatbot;