import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CsrfTokenContext } from '../context/CsrfTokenContext';
import { toast } from 'sonner';
import API_BASE_URL from "@/config";

const useLogout = () => {
    
    const { csrfToken, logout: contextLogout } = useContext(CsrfTokenContext);

    const navigate = useNavigate();

    const logout = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/logout/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Token ${csrfToken}`,
                },
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to log out");
            }

            const data = await response.json();
            toast.success(data.message || "Logged out successfully");
            
        } catch (error) {
            console.error('Error logging out:', error);
            toast.error(error.message || "Failed to log out");
        } finally{

            contextLogout();
            navigate('/');
            
        }
    };

    return logout;
};

export default useLogout;
