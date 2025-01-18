import PropTypes from 'prop-types';
import logo from "@/assets/logo1.png"
import { Link } from 'react-router-dom';

const Title = ({title}) => {
    return (
        
    <div className=" flex items-center px-8 bg-[#2c3e50]">
        <Link to={"/"} className="max-h-12 max-w-12 bg-white rounded-full">
            <img src={logo} alt="Logo" />
        </Link>
        <h1 className="text-white text-2xl font-medium py-4 w-full text-center">
            {title}
        </h1>
    </div>
  
  
    );
};

Title.propTypes = {
    title: PropTypes.string.isRequired
};

export default Title;
