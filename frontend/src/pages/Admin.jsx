import "./Page.css";

import Title from "@/components/Title/Title";
import ChatbotGrid from "@/components/Grids/ChatbotGrid";
import CreateChatbot from "@/components/Dailog/CreateChatbot";
import ButtonContainer from "@/components/Containers/ButtonContainer";
import { Button } from "@/components/ui/button";
import useLogout from "@/hooks/useLogout";

import { useState } from 'react';

const Admin = () => {

    const [chatbots, setchatbots] = useState([]);
    const logout = useLogout();

    return (
        <>
            <div className="adminpagee">
                <div>
                    <Title title="Admin Page" />
                </div>
                <div>
                    <div className="px-4 md:px-10 lg:px-40 py-8">
                        <ButtonContainer title="Create a New Talk Show">
                            <CreateChatbot setchatbots={setchatbots} />
                        </ButtonContainer>
                    </div>
                    <div className="px-4 md:px-10 lg:px-40 py-8">
                        <ChatbotGrid chatbots={chatbots} setchatbots={setchatbots}/>
                    </div>
                    <div className="px-4 md:px-10 lg:px-40 py-8">
                        <ButtonContainer title="Actions">
                            <Button variant="secondary" onClick={logout} >logout</Button>
                        </ButtonContainer>
                    </div>
                </div>
            </div>
            
        </>
    );
};

export default Admin;