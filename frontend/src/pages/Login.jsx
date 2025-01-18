import { z } from 'zod';
import { useState } from 'react';
import { toast } from "sonner";
import { useEffect } from 'react';
import { useNavigate } from "react-router-dom";

import LoginForm from '@/components/login/LoginForm';

import API_BASE_URL from "@/config"
import { useContext } from 'react';
import { CsrfTokenContext } from "@/context/CsrfTokenContext";

export default function Login() {

  const { csrfToken  , setCsrfToken } = useContext(CsrfTokenContext);
  const navigate  = useNavigate();

  useEffect(() => {
    if(csrfToken){
      navigate("/admin");
    }
  }, [navigate , csrfToken]);

  const schema = z.object({
    Username: z.string().min(5).max(50),
    Password: z.string().min(1).max(50),
  });

  const [formData, setFormData] = useState({
    Username: '',
    Password: '',
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

      login(formData.Username, formData.Password);
      
    } catch (error) {

      if (error instanceof z.ZodError) {
        setFormErrors(error.errors);
      }

    }
  };

  async function login(username, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        // credentials: 'include',
        body: JSON.stringify({ username: username , password: password }),
      });

      if (!response.ok) {
        throw new Error('Failed to send message');
      }

      const data = await response.json();
      console.log(data);

      if(data.success){

        toast.success("Logged In Successfully");
        localStorage.setItem('csrfToken', data.csrf_token);
        setCsrfToken(data.csrf_token);
        navigate("/admin");

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
    
          <LoginForm
            onSubmit={handleSubmit}
            formErrors={formErrors}
            handleChange={handleChange}
            formData={formData}
          />
          
  )
}