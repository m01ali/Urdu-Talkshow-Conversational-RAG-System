import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import logo from "@/assets/logo1.png"
import menu from "@/assets/menu.png"

import { useContext } from 'react';
import { CsrfTokenContext } from "@/context/CsrfTokenContext";
import useLogout from "@/hooks/useLogout";

import { Button } from "@/components/ui/button";


const Navbar = () => {

    const [isOpen, setIsOpen] = useState(false);
    const [loggedIn, setLoggedIn] = useState(false);

    const { csrfToken } = useContext(CsrfTokenContext);
    const logout = useLogout();


    useEffect(() => {
        if (csrfToken) {
            setLoggedIn(true);
        } else {
            setLoggedIn(false);
        }
    }, [csrfToken]);





  return (
    <nav>
      <section className="w-full px-2 lg:px-8 text-gray-700 bg-white">
        <div className="container flex flex-wrap items-center justify-between py-2 lg:py-5 mx-auto md:flex-row max-w-7xl">
          
          <div className="relative flex flex-col md:flex-row">
            
                <div className="max-h-12 max-w-12">
                    <img src={logo} alt="Logo" />
                </div>
            
                <nav className="hidden md:flex flex-wrap items-center mb-5 text-base md:mb-0 md:pl-8 md:ml-8 md:border-l md:border-gray-200">
                    <Link to="/browseall" className="mr-5 font-medium leading-6 text-gray-600 hover:text-gray-900">
                        Browse All
                    </Link>
                </nav>
          </div>

          {
            loggedIn ? (
              <div className="hidden md:inline-flex items-center ml-5 space-x-6 lg:justify-end">
                <Button className="text-base font-medium leading-6 text-gray-600 whitespace-no-wrap transition duration-150 ease-in-out hover:text-gray-900"
                onClick={logout} variant="primary">
                    Logout
                </Button>
                <Link to="/admin" className="inline-flex items-center justify-center px-4 py-2 text-base font-medium leading-6 text-white whitespace-no-wrap bg-black border border-transparent rounded-md shadow-sm hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600">
                    Home
                </Link>
              </div>
            ) : 
            (
              <div className="hidden md:inline-flex items-center ml-5 space-x-6 lg:justify-end">
                <Link to="/login" className="text-base font-medium leading-6 text-gray-600 whitespace-no-wrap transition duration-150 ease-in-out hover:text-gray-900">
                  Sign in
                </Link>
                <Link to="/signup" className="inline-flex items-center justify-center px-4 py-2 text-base font-medium leading-6 text-white whitespace-no-wrap bg-black border border-transparent rounded-md shadow-sm hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600">
                  Sign up
                </Link>
              </div>
            )

          }  
         

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 hover:text-gray-900 focus:outline-none">
                <img src={menu} alt="Menu" className="w-7 h-7" />
            </button>
          </div>
          
        </div>

        {isOpen && (

        loggedIn ?
        (
            <div className="md:hidden">
                <nav className="flex flex-col items-start px-4 pt-2 pb-4 space-y-2 bg-white border-t border-gray-200">
                <Link to="/browseall" className="font-medium leading-6 text-gray-600 hover:text-gray-900">
                    Browse All
                </Link>
                <Link to="/admin" className='font-medium leading-6 text-gray-600 hover:text-gray-900'>
                    Admin
                </Link>
                <p className='font-medium leading-6 text-gray-600 hover:text-gray-900 cursor-pointer'
                        onClick={logout}>
                    Logout
                </p>
                </nav>
            </div>
        )
        :
        ( 
        <div className="md:hidden">
            <nav className="flex flex-col items-start px-4 pt-2 pb-4 space-y-2 bg-white border-t border-gray-200">
              <Link to="/browseall" className="font-medium leading-6 text-gray-600 hover:text-gray-900">
                Browse All
              </Link>
              <Link to="/login" className="font-medium leading-6 text-gray-600 hover:text-gray-900">
                Sign in
              </Link>
              <Link to="/signup" className="font-medium leading-6 text-gray-600 hover:text-gray-900">
                Sign up
              </Link>
            </nav>
          </div>
        )
    )}
      </section>
    </nav>
  );
};

export default Navbar;
