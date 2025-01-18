import DocCard from "../Cards/DocCard";

import PropTypes from 'prop-types';

const DocContainers = ({ documents , removeDocument}) => {
    return (
        <div className="p-4 flex flex-col gap-2 rounded-lg border border-black shadow-lg 
                        bg-opacity-80 bg-white hover:bg-opacity-100 transition duration-300 ease-in-out">
            <h1 className="text-xl font-medium">Current Documents in the Knowledge Base</h1>
            {documents && documents.map((document) => (
                <DocCard key={document.documentname} fileName={document.documentname} removeDocument={removeDocument} />
            ))}
            {
                documents.length === 0 && (
                    <h1>No Documents Added Yet</h1>
                )
            }
        </div>
    );
};

DocContainers.propTypes = {
    documents: PropTypes.array,
    removeDocument: PropTypes.func.isRequired,
};

export default DocContainers;