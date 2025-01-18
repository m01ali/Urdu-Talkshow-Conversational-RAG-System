import PropTypes from 'prop-types';

import './message.css';

function Message({text , user , sidebot}) {
    return (
        sidebot ?  
        <div className={`message ${user ? 'left' : 'right'}`}>
            <div className={`sidemessagecontainer ${user ? 'left' : 'right'}`}>
                    <h3>{user ? 'You' : 'Bot'}</h3>
                    <p>{text}</p>
            </div>
        </div> 
        :
        <div className={`message ${user ? 'left' : 'right'}`}>
            <div className={`messagecontainer ${user ? 'left' : 'right'}`}>
                    <h3>{user ? 'You' : 'Bot'}</h3>
                    <p>{text}</p>
            </div>
        </div>  


    )
}  

Message.propTypes = {
    text: PropTypes.string.isRequired,
    user: PropTypes.bool , 
    sidebot: PropTypes.bool
};

Message.defaultProps = {
    user: false ,
    sidebot: false
};

export default Message
  
