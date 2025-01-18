import API_BASE_URL from "@/config";
import { toast } from "sonner";

import { useEffect } from 'react';
import { Link } from "react-router-dom";

import propTypes from 'prop-types';

const AllChatbotsGrid = ({chatbots , setchatbots}) => {


    useEffect(() => {
        getChatbots();
    }, []);

    async function getChatbots() {
        try {
            const response = await fetch(`${API_BASE_URL}/getallchatbots/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to Fetch Data");
            }

            const data = await response.json();
            console.log(data);
            setchatbots(data.data);

            return data.response;
        } catch (error) {
            console.error('Failed to Fetch Data:', error);
            toast.error(error || "Failed to Fetch Data");
        }
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
                                     space-y-2"
                        >

                          <h2 className="text-xl font-semibold select-none">{chatbot.title}</h2>
                          <h1 className="text-lg font-medium select-none">{chatbot.name}</h1>
                          <p className="text-sm text-gray-800 select-none">
                            {new Date(chatbot.publish_date).toLocaleDateString()}
                          </p>
                          
                          
                            <Link
                                className="bg-cyan-700 text-white border border-black rounded-full py-1 px-4 text-sm hover:bg-black"
                                to={`/chat/${chatbot.name}`}
                            >
                                Start Chat
                            </Link>
                          

                        </div>
                      ))
                }
            </div>

        </>
    );
};

AllChatbotsGrid.propTypes = {
    chatbots: propTypes.array.isRequired,
    setchatbots: propTypes.func.isRequired,
};

export default AllChatbotsGrid;

