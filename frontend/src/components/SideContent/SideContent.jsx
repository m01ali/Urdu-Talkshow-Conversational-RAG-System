import PropTypes from 'prop-types';
import API_BASE_URL from "@/config"

import { useEffect } from 'react';

import { Loader2 } from "lucide-react"


import "./SideContent.css"

import { toast } from 'sonner';
const SideContent = ({ chatbotname , chatbotData , setChatbotData}) => {
    
    useEffect(() => {

        getChatbotData();

    }, [chatbotname]);

    async function getChatbotData() {
        try {
            const response = await fetch(`${API_BASE_URL}/${chatbotname}/getchatbotdata/`, {
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
            setChatbotData(data.data);
        } catch (error) {
            console.error('Error fetching chatbot data:', error);
            toast.error(error || "Failed to Fetch Data");
        }
    }

    if (!chatbotData) {
        return <div className='sidecontentarealoader'>
            <Loader2 className="mr-2 h-10 w-10 animate-spin" /> 
        </div>;
    }

    function splitContent(content) {
        // Split the content based on \n
        const paragraphs = content.split(/\r?\n/);
        return paragraphs;
    }
    

    return (
        <div className="sidecontentarea">
            <ul className="space-y-4">
            {chatbotData.documents.map(doc => (
                <li key={doc.id} className="p-4 bg-gray-100 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-gray-800 mb-2 text-center bg-gray-200 p-2 rounded">{doc.documentname}</h3>
                    {splitContent(doc.page_content).map((paragraph, index) => (
                        <p 
                            key={index} 
                            className={`mb-3 ${index % 2 === 0 ? 'text-gray-700 bg-gray-200' : 'text-gray-800 bg-gray-100'}`}
                        >
                            {paragraph}
                        </p>
                    ))}
                </li>
            ))}
            </ul>
        </div>
    );
    
};

SideContent.propTypes = {
    chatbotname: PropTypes.string.isRequired,
    chatbotData: PropTypes.object,
    setChatbotData: PropTypes.func.isRequired,
};

export default SideContent;
