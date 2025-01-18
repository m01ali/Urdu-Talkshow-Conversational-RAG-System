import './DocCard.css';
import API_BASE_URL from "@/config";

import { useContext } from 'react';
import { CsrfTokenContext } from "@/context/CsrfTokenContext";
import { toast } from "sonner";

import PropTypes from 'prop-types';

import { useState } from 'react';

import { useParams } from 'react-router-dom';

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogFooter,
    DialogTitle,
    DialogClose,
    DialogTrigger,
  } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"



const DocCard = ({fileName , removeDocument}) => {

    const { csrfToken , handleUnauthorized  } = useContext(CsrfTokenContext);
    const { chatbotname } = useParams();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    
    async function onRemove() {

        if (!fileName) {
            toast("Please provide a file name.");
            return;
        }

        if (!chatbotname) {
            toast("Please provide a chatbot name.");
            return;
        }

        if (!csrfToken) {
            toast("Not Authorized.");
            return;
        }

        setIsLoading(true);

        try {
            const response = await fetch(`${API_BASE_URL}/${chatbotname}/deletedocument/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${csrfToken}`,
                },
                body: JSON.stringify({ documentname : fileName }),
            });

            if (!response.ok) {
                if (response.status === 401) {
                    handleUnauthorized();
                    return;
                  }
                const errorData = await response.json();
                throw new Error(errorData.message || "Error in Removing Document");
            }

            const data = await response.json();
            console.log(data);

            toast.success(data.message || "Document Removed Successfully");

            removeDocument(fileName);

            return data.response;
        } catch (error) {
            console.error('Error in performing Action:', error);
            toast.error(error || "Error in Removing Document");
        } finally {
            setIsLoading(false);
            setIsOpen(false);
        }
    }


    return (
        <div className="DocumentCard">
            
            <p>{fileName}</p>
            
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogTrigger asChild>
                    <Button onClick={() => setIsOpen(true)} variant="destructive" >Remove</Button>
                </DialogTrigger>
                
                <DialogContent className="sm:max-w-[425px]">
                
                    <DialogHeader>
                        <DialogTitle>Are you Sure</DialogTitle>
                    </DialogHeader>

                    
                    <DialogFooter>
                    
                        <Button onClick={onRemove} disabled={isLoading} variant="destructive" > Confirm </Button>

                        <DialogClose asChild>
                            <Button type="button"> Cancel</Button>
                        </DialogClose>

                    </DialogFooter>

                </DialogContent>

            </Dialog>

        </div>
    );
};

DocCard.propTypes = {
    fileName: PropTypes.string.isRequired,
    name: PropTypes.string,
    removeDocument: PropTypes.func.isRequired,
};


export default DocCard;