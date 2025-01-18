import  { useState } from 'react';

const Test = () => {
  
  const [paragraphText, setParagraphText] = useState(
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Phasellus imperdiet, nulla et dictum interdum, nisi lorem egestas odio, vitae scelerisque enim ligula venenatis dolor. Maecenas nisl est, ultrices nec congue eget, auctor vitae massa. Another paragraph with different content to select and test. Select some text here as well to see if the selection works across multiple paragraphs.'
  );

  const [selectedText, setSelectedText] = useState('');
  const [buttonPosition, setButtonPosition] = useState({ x: 0, y: 0 });
  const [showButton, setShowButton] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [inputtext, setInputText] = useState('');

  const handleMouseUp = () => {

    const selection = window.getSelection();
    const selectedText = selection.toString();

    if (selectedText) {

      setSelectedText(selectedText);
      const range = selection.getRangeAt(0).cloneRange();
      const rect = range.getBoundingClientRect();
      setButtonPosition({ x: rect.right, y: rect.bottom });
      setShowButton(true);

    } else {

      setShowButton(false);
      setInputText('');
      setSelectedText('');
      setShowDropdown(false);

    }
  };

  const handleButtonClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleInputChange = (event) => {
    setInputText(event.target.value);
  }

  const handlemouseup = (e) => {
    e.stopPropagation();
  }

  const handleReplaceText = () => {
    if (selectedText) {
      const updatedText = paragraphText.replace(selectedText, inputtext);
      setParagraphText(updatedText);
      setShowDropdown(false);
      setShowButton(false);
      setInputText('');
      setSelectedText('');
    }
  };


  return (
    <div onMouseUp={handleMouseUp}>
      
      <p>{paragraphText}</p>
      

      {showButton && (
        <div
          style={{
            position: 'absolute',
            left: `${buttonPosition.x}px`,
            top: `${buttonPosition.y}px`,
          }}
          className="dropdown"
        >
          <button onClick={handleButtonClick}>▼</button>
          {showDropdown && (
            
            <div style={{ display: 'flex', flexDirection: 'column', marginTop: '5px', background: 'white', border: '1px solid black', padding: '10px' }} 
            onMouseUp={handlemouseup}>

              <input type="text" placeholder="Input field" value={inputtext} onChange={handleInputChange} />
              <button onClick={handleReplaceText}>Replace</button>
              <button>Button 2</button>
              <button>Button 3</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Test;