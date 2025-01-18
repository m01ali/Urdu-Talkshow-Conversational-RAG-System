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

import { useNavigate } from 'react-router-dom';

const CreateChatbot = ({chatbotname}) => {

    const navigate = useNavigate();
    
    const { csrfToken , handleUnauthorized } = useContext(CsrfTokenContext);
    const [ input , setInput ] = useState("");
    const [ isOpen, setIsOpen] = useState(false);
    const [ isLoading, setIsLoading] = useState(false);
    

    const deletechatbot = async () => {

        
        if (!input) {
            toast("Please Enter Talkshow name.");
            return;
        }

        if (input!==chatbotname) {
            toast("Please Enter Talkshow name same as the Talkshow name in the URL.");
            return;
        }
        
        setIsLoading(true);
        
        try {
          console.log(input);

          const response = await fetch(`${API_BASE_URL}/${chatbotname}/deletechatbot/`, {
            method: 'POST',
            body: JSON.stringify({ chatbotname: input }),
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
            throw new Error(errorData.message || "Failed to Delete Talkshow");
          }
        
          const data = await response.json();
          console.log(data);
          console.log(data.message); 
          setIsOpen(false);
                    
          toast("Talkshow Deleted Successfully");

          navigate("/admin");

        } catch (error) {
          console.error('Error performing action:', error);
          toast.error(error || "Failed to delete Talkshow");
          
        } finally {
          setInput("");   
          setIsLoading(false);
        }

      };
      

    return (
   
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button onClick={() => setIsOpen(true)} variant="destructive" >Delete Talkshow</Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-[425px]">
        
        <DialogHeader>
          <DialogTitle>Delete Talkshow</DialogTitle>
          <DialogDescription>
            Please write the Talkshow name to confirm deletion.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            
            <Label htmlFor="name" className="text-right">
              Name : 
            </Label>

            <Input
              id="name"
              className="col-span-3"
              type="text"
              value={input}
              accept="application/pdf" 
              onChange={(e) => setInput(e.target.value)}
            />

          </div>
        </div>
        
        <DialogFooter>
          
          <Button onClick={deletechatbot} disabled={isLoading} variant="destructive">
            {isLoading ? "Delete..." : "Delete"}
          </Button>

          <DialogClose asChild>
            <Button type="button"> 
              Cancel
            </Button>
          </DialogClose>

        </DialogFooter>
      </DialogContent>

    </Dialog>
     
    );
};

CreateChatbot.propTypes = {
    chatbotname: propTypes.string.isRequired
}

export default CreateChatbot;