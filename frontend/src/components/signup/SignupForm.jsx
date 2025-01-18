import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';

import background from "@/assets/background.webp"


const SignupForm = ({ onSubmit, formErrors, handleChange, formData }) => {
    return (
    <div className="w-full lg:grid lg:grid-cols-2 h-screen">

        <div className="hidden bg-muted lg:block">
        <img
          src={background}
          alt="Image"
          width="1920"
          height="1080"
          className="h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
        />
      </div>

        <div className="flex items-center justify-center py-12 p-8 h-screen">
            <div className="mx-auto grid w-[350px] gap-6">
                <div className="grid gap-2 text-center">
                    <h1 className="text-3xl font-bold">Signup</h1>
                    <p className="text-balance text-muted-foreground">
                    Where conversation meets information
                    </p>
                </div>
            <div className="grid gap-4">
                <div className="grid gap-2">
                <Label htmlFor="Email">Email</Label>
                <Input
                    id="Email"
                    type="email"
                    placeholder="email@email.com"
                    name="Email"
                    required
                    value={formData.Email}
                    onChange={handleChange}
                />
                </div>
                <div className="grid gap-2">
                <Label htmlFor="Username">Username</Label>
                <Input
                    id="Username"
                    type="text"
                    placeholder="Your Username"
                    name="Username"
                    required
                    value={formData.Username}
                    onChange={handleChange}
                />
                </div>
                <div className="grid gap-2">
                <Label htmlFor="Password">Password</Label>        
                <Input 
                    id="Password" 
                    type="password" 
                    required
                    name="Password"
                    value={formData.Password}
                    onChange={handleChange}
                />
                </div>
                <div className="grid gap-2">
                <Label htmlFor="ConfirmPassword">Confirm Password</Label>        
                <Input 
                    id="ConfirmPassword" 
                    type="Password" 
                    required
                    name="ConfirmPassword"
                    value={formData.ConfirmPassword}
                    onChange={handleChange}
                />
                </div>
                <div className="text-red-500 text-xs flex flex-col">
                {formErrors.map((error, index) => (
                    <span key={index}>{error.path[0]} : {error.message}</span>
                ))}
                </div>
                <Button onClick={onSubmit} className="w-full">
                Signup
                </Button>
            </div>
        <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link to="/login" className="underline">
              Login
            </Link>
          </div>
        </div>
      </div>
    </div>
    );
}


SignupForm.propTypes = {
    onSubmit: PropTypes.func.isRequired,
    formErrors: PropTypes.array.isRequired,
    handleChange: PropTypes.func.isRequired,
    formData: PropTypes.object.isRequired
};
  
export default SignupForm;