import { useState } from 'react';
import API_BASE_URL from "@/config";
import { useContext } from 'react';
import { CsrfTokenContext } from "@/context/CsrfTokenContext";

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

import { z } from 'zod';


const CreateChatbot = ({setchatbots}) => {

  const schema = z.object({
    chatbotname: z.string()
      .min(3, { message: "Name must be at least 3 characters long" })
      .max(50, { message: "Name must be at most 50 characters long" })
      .regex(/^[a-zA-Z0-9]+$/, { message: "Name must contain only alphabets and integers, with no spaces or special characters" }),
    title: z.string()
      .min(3, { message: "Title must be at least 3 characters long" })
      .max(50, { message: "Title must be at most 50 characters long" }),
    publishdate: z.date(),
  });
  
    
    const { csrfToken  , handleUnauthorized } = useContext(CsrfTokenContext);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    
    const [formData, setFormData] = useState({
        chatbotname: '',
        title: '',
        publishdate: '',
    });

    const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    };


    const createchatbot = async () => {

        try {

          const parsedData = {
            ...formData,
            publishdate: new Date(formData.publishdate),
          };
          
          schema.parse(parsedData);
          
        } catch (error) {
          if (error instanceof z.ZodError) {
            toast.error(error.errors[0].message)
          } else {
            toast.error("Failed to create new Talkshow");
            console.error('Error submitting Data:', error);
          }
          return;
        }
        
        setIsLoading(true);
        
        try {
          console.log(formData);

          const response = await fetch(`${API_BASE_URL}/createchatbot/`, {
            method: 'POST',

            body: JSON.stringify({ 
              chatbotname: formData.chatbotname , 
              title: formData.title , 
              publishdate: formData.publishdate
            }),

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
            throw new Error(errorData.message || "Failed to create new Talkshow");
          }
        
          const data = await response.json();
          console.log(data);
          console.log(data.message); 
          setIsOpen(false);
          
          setchatbots((prevData) => ([...prevData, data.data]));
          
          toast("Talkshow Created Successfully");

        } catch (error) {
          console.error('Error submitting file:', error);
          toast.error(error || "Failed to create new Talkshow");
          
        } finally {
          setFormData("");   
          setIsLoading(false);
        }

      };
      

    return (
   
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button onClick={() => setIsOpen(true)}>Create</Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-[425px]">
        
        <DialogHeader>
          <DialogTitle>Create New Talkshow</DialogTitle>
          <DialogDescription>
            Please write a unique Talkshow Name and any Title of Your Choice.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            
            <Label htmlFor="chatbotname" className="text-right">
                Name 
            </Label>

            <Input
              id="chatbotname"
              name="chatbotname"
              className="col-span-3"
              type="text"
              value={formData.chatbotname}
              accept="application/pdf" 
              onChange={handleChange}
            />

          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            
            <Label htmlFor="title" className="text-right">
               Title
            </Label>

            <Input
              id="title"
              name="title"
              className="col-span-3"
              type="text"
              value={formData.title}
              accept="application/pdf" 
              onChange={handleChange}
            />

          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            
            <Label htmlFor="publishdate" className="text-right">
               Airdate
            </Label>

            <Input
              id="publishdate"
              name="publishdate"
              className="col-span-3"
              type="date"
              value={formData.publishdate}
              accept="application/pdf" 
              onChange={handleChange}
            />

          </div>
        </div>

       
        <DialogFooter>
          
          <Button onClick={createchatbot} disabled={isLoading}>
            {isLoading ? "Creating..." : "Create"}
          </Button>

          <DialogClose asChild>
            <Button type="button" variant="secondary"> 
              Cancel
            </Button>
          </DialogClose>

        </DialogFooter>
      </DialogContent>

    </Dialog>
     
    );
};

CreateChatbot.propTypes = {
    setchatbots: propTypes.func.isRequired,
}

export default CreateChatbot;