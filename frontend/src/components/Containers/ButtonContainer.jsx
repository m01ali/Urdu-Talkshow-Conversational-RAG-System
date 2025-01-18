import PropTypes from 'prop-types';

const ButtonContainer = ({ title, children }) => {
    return (
        <div className="flex justify-between items-center p-3 bg-opacity-85 bg-white 
                        rounded-lg border border-black shadow-md hover:bg-opacity-100
                        transition duration-300 ease-in-out">
            <h1 className="text-xl font-medium">{title}</h1>
            {children}
        </div>
    );
};

ButtonContainer.propTypes = {
    title: PropTypes.string.isRequired,
    children: PropTypes.node.isRequired,
};

export default ButtonContainer;
