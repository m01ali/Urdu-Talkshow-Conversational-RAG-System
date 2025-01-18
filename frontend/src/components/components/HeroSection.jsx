import PropTypes from 'prop-types';

const HeroSection = ({ children }) => {
    return (
        <section className="px-2 py-10 md:px-0 bg-white bg-opacity-20">
                <div className="container items-center max-w-6xl px-8 mx-auto xl:px-5">
                    <div className="flex flex-wrap items-center sm:-mx-3">
                        {children}
                    </div>
                </div>
            </section>
    );
};

export default HeroSection;

HeroSection.propTypes = {
    children: PropTypes.node.isRequired,
};

