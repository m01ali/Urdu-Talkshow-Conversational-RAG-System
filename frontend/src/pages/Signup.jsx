import { z } from 'zod';
import { useEffect, useState } from 'react';
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

import SignupForm from '@/components/signup/SignupForm';

import API_BASE_URL from "@/config"
import { useContext } from 'react';
import { CsrfTokenContext } from "@/context/CsrfTokenContext";

export default function Signup() {

  const { csrfToken } = useContext(CsrfTokenContext);
  const navigate  = useNavigate();

  useEffect(() => {
    if(csrfToken){
      navigate("/admin");
    }
  }, [navigate , csrfToken]);

  const schema = z.object({

    Email: z.string().email(),
    Username: z.string().min(5).max(50),
    Password: z.string().min(5).max(50),
    ConfirmPassword: z.string().min(5).max(50), 

  }).refine((data) => data.Password === data.ConfirmPassword, {
    message: "Passwords don't match",
    path: ["ConfirmPassword"], // Path of error
  });


  const [formData, setFormData] = useState({
    Email: '',
    Username: '',
    Password: '',
    ConfirmPassword: '',
  });

  const [formErrors, setFormErrors] = useState([]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log(formData)
    try {

      schema.parse(formData);
      setFormErrors([]);

      signup(formData.Username, formData.Password , formData.Email);
      
    } catch (error) {
      
      if (error instanceof z.ZodError) {
        console.log(error.errors);
        setFormErrors(error.errors);
      }

    }
  };

  async function signup(username, password , email) {
    try {
      const response = await fetch(`${API_BASE_URL}/signup/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        // credentials: 'include',
        body: JSON.stringify({ username: username , password: password , email : email }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      console.log(data);

      if(data.success){
        toast.success(data.message);
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }else{
        toast.error("Login Error : " + data.message , {
          style: {
            background: '#c70808',
            color:"white",
            border:"1px solid white"
          },
        });
      }

    } catch (error) {
      console.error('Error sending message:', error);
      toast("Something Went Wrong");
      throw error;
    }
  }


  return (
    
          <SignupForm
            onSubmit={handleSubmit}
            formErrors={formErrors}
            handleChange={handleChange}
            formData={formData}
          />
          
  )
}