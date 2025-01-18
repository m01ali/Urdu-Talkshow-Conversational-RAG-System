import { useState } from 'react';
import API_BASE_URL from "@/config";
import { useContext } from 'react';
import { CsrfTokenContext } from "@/context/CsrfTokenContext";
import { useParams } from 'react-router-dom';

import { toast } from "sonner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogClose,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import propTypes from 'prop-types';

const PdfInput = ({setDocuments}) => {

    const { chatbotname } = useParams();

    const { csrfToken , handleUnauthorized } = useContext(CsrfTokenContext);
    const [selectedFile, setSelectedFile] = useState(null);
    const [loading , setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);


    const handleFileChange = (event) => {
        const file = event.target.files[0];
        setSelectedFile(file);
    };

    const submitFile = async (selectedFile) => {

        if (!selectedFile) {
          toast("Please Select a PDF file.");
          return;
        }

        setLoading(true);
      
        try {
          const formData = new FormData();
          formData.append('docs', selectedFile);
      
          const response = await fetch(`${API_BASE_URL}/${chatbotname}/adddocument/`, {
            method: 'POST',
            body: formData,
            headers: {
               'Authorization': `Token ${csrfToken}`,
            },
          });

          if (!response.ok) {
            if (response.status === 401) {
              handleUnauthorized();
              return;
            }
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to submit file");
          }
        
          const data = await response.json();
          console.log(data.message); 

          toast("File Submitted Successfully");
          setDocuments(prevvalue => [...prevvalue, data.data])
          setIsOpen(false);

        } catch (error) {
          console.error('Error submitting file:', error);
          toast.error(error || "Failed to submit file");
          
        } finally {
          setSelectedFile(null);
          setLoading(false);
        }

        
      };
      

    return (
   
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button onClick={() => setIsOpen(true)}>Add New Document</Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-[425px]">
        
        <DialogHeader>
          <DialogTitle>Add New Document</DialogTitle>
          <DialogDescription>
            Upload a new PDF document to add in Knowledge Base.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            
            <Label htmlFor="fileInput" className="text-right">
              PDF Input
            </Label>

            <Input
              id="fileInput"
              className="col-span-3"
              type="file"
              accept="application/pdf" 
              onChange={handleFileChange}
            />

          </div>
        </div>
        
        <DialogFooter>
          
          <Button onClick={() => submitFile(selectedFile)} disabled={loading}>
            {loading ? "Uploading..." : "Submit"}
          </Button>

          <DialogClose asChild>
            <Button type="button" variant="secondary">
              Back
            </Button>
          </DialogClose>

        </DialogFooter>
      </DialogContent>

    </Dialog>
     
    );
};

PdfInput.propTypes = {
    setDocuments: propTypes.func.isRequired,
};

export default PdfInput;

