import API_BASE_URL from "@/config";

import PdfInput from "@/components/pdfinput/PdfInput";
import DocContainers from "@/components/Containers/DocContainers";
import ButtonContainer from "@/components/Containers/ButtonContainer";
import { useContext } from 'react';
import { useState , useEffect } from "react";
import { CsrfTokenContext } from "@/context/CsrfTokenContext";
import { useParams } from 'react-router-dom';

import AudioInput from "@/components/pdfinput/AudioInput";


import { toast } from "sonner";

const DocumentComponent = () => {

    const { chatbotname } = useParams();
    
    const { csrfToken  , handleUnauthorized } = useContext(CsrfTokenContext);
    
    const [ documents , setDocuments ]= useState([]);
    
    useEffect(() => {
        if (csrfToken && chatbotname) {
            getDocuments();
        }
    }, [csrfToken , chatbotname]);

    async function getDocuments() {
        try {
            const response = await fetch(`${API_BASE_URL}/${chatbotname}/getdocuments/`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${csrfToken}`,
                },
            });

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
            setDocuments(data.data);

            return data.response;
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error(error || "Failed to Fetch Data");
        }
    }

    const removeDocument = (fileName) => {
        setDocuments(documents.filter(doc => doc.documentname !== fileName));
    };

    return (
        <>  
            <ButtonContainer title="Add New Data in Knowledge Base">
                <div className="flex gap-4" >
                    <PdfInput setDocuments={setDocuments} />
                    <AudioInput setDocuments={setDocuments} /> 
                </div>
            </ButtonContainer>
        
            <div>
                <DocContainers documents={documents} removeDocument={removeDocument} />
            </div>
            
            
        </>
    );
};


export default DocumentComponent;