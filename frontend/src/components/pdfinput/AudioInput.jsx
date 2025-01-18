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

const AudioInput = ({setDocuments}) => {

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
          toast("Please Select a Audio file.");
          return;
        }

        setLoading(true);
      
        toast("Serivce is not available right now.");

        
      };
      

    return (
   
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button onClick={() => setIsOpen(true)}>Add New Audio</Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-[425px]">
        
        <DialogHeader>
          <DialogTitle>Add New Audio</DialogTitle>
          <DialogDescription>
            Upload a new Audio That will be transcribed and Will be Added in Knowledge Base
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            
            <Label htmlFor="fileInput" className="text-right">
              Audio Input
            </Label>

            <Input
              id="fileInput"
              className="col-span-3"
              type="file"
              accept="application/mp3" 
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

AudioInput.propTypes = {
    setDocuments: propTypes.func.isRequired,
};

export default AudioInput;

