import API_BASE_URL from "@/config";
import { useContext } from 'react';
import { CsrfTokenContext } from "@/context/CsrfTokenContext";
import { toast } from "sonner";

import { useEffect } from 'react';
import { useNavigate } from "react-router-dom";

import propTypes from 'prop-types';

const ChatbotGrid = ({chatbots , setchatbots}) => {

    const { csrfToken , handleUnauthorized } = useContext(CsrfTokenContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (csrfToken) {
            getChatbots();
        }
    }, [csrfToken]);

    async function getChatbots() {
        try {
            const response = await fetch(`${API_BASE_URL}/chatbotbyuser/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${csrfToken}`,
                },
            });

            console.log("helloe" , response);

            if (!response.ok) {
                if (response.status === 401) {
                    handleUnauthorized();
                    return;
                  }
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to Fetch Data");
            }

            const data = await response.json();
            console.log(data);
            setchatbots(data.data);

            return data.response;
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error(error || "Failed to Fetch Data");
        }
    }


    const handleonClick = (chatbot) => {
        console.log(chatbot);
        navigate(`/chatbot/${chatbot.name}`);
    }

    return (
        <>
            <div className="grid grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {
                    chatbots.map((chatbot, index) => (
                        <div
                            key={index}
                            className="p-6 flex flex-col text-center items-center justify-center shadow-lg
                                     border-2 border-solid border-black rounded-lg bg-white bg-opacity-90
                                     hover:bg-opacity-100 hover:shadow-xl transition duration-300 ease-in-out
                                     space-y-2 cursor-pointer"
                            onClick={() => handleonClick(chatbot)}
                        >

                            <h2 className="text-xl font-semibold select-none">{chatbot.title}</h2>
                            <h1 className="text-lg font-medium select-none">{chatbot.name}</h1>
                            <p className="text-sm text-gray-800 select-none">
                                {new Date(chatbot.publish_date).toLocaleDateString()}
                            </p>
                               
                        </div>
                      ))
                }
            </div>

        </>
    );
};

ChatbotGrid.propTypes = {
    chatbots: propTypes.array.isRequired,
    setchatbots: propTypes.func.isRequired,
};

export default ChatbotGrid;

