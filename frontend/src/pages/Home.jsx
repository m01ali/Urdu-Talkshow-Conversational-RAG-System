import "./Page.css";
import { Link } from 'react-router-dom';

import bannerImage from "@/assets/background.png"
import bannerImage2 from "@/assets/banner2.webp"

import Sidebot from "@/components/SideBot/Sidebot";
import Navbar from "@/components/components/Navbar";
import HeroSection from "@/components/components/HeroSection";



const Home = () => {
    return (
        <>
            <div className="homepage">

            {/* SideBot */}
            <Sidebot />

            {/* <!-- Navbar --> */}
            <Navbar />


            {/* <!-- Section 2 --> */}
            <HeroSection>
                <div className="w-full md:w-1/2 md:px-3">
                    <div className="w-full pb-6 space-y-6 sm:max-w-md lg:max-w-lg md:space-y-4 lg:space-y-8 xl:space-y-9 sm:pr-5 lg:pr-0 md:pb-0">
                    <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-4xl lg:text-5xl xl:text-6xl">
                        <span className="block xl:inline">Custom</span>
                        <span className="block text-indigo-600 xl:inline">Support</span>
                        <div>
                            <p className="mx-auto text-sm text-black mt-3 font-semibold sm:max-w-md lg:text-xl md:max-w-3xl">NLP Driven Generative AI For Personalized Data</p>
                        </div>
                    </h1>

                    <p className="mx-auto text-base text-black sm:max-w-md  md:max-w-3xl">Now Create Custom, Customer Service Support Bot Using Our Solution for your bussiness</p>
                    
                    <div className="relative flex flex-col sm:flex-row sm:space-x-4">
                        <Link to="/login" className="flex items-center w-full px-6 py-3 mb-3 text-lg text-white bg-black rounded-md sm:mb-0 hover:bg-gray-700 sm:w-auto">
                            Start Creating Now
                        </Link>

                        <Link to="/NustBot" className="flex items-center px-6 py-3 text-gray-500 bg-gray-100 rounded-md hover:bg-gray-200 hover:text-gray-600">
                            Try Demo Now
                        </Link>
                    </div>
                    </div>
                </div>

                <div className="w-full md:w-1/2">
                    <div className="w-full h-[450px] overflow-hidden rounded-md shadow-xl sm:rounded-xl">
                        <img src={bannerImage}></img>
                    </div>
                </div>

            </HeroSection>
            
            {/* <!-- Section 3 --> */}
            <HeroSection>

                <div className="w-full md:w-1/2">
                    <div className="w-full overflow-hidden rounded-md shadow-xl sm:rounded-xl">
                        <img src={bannerImage2}></img>
                    </div>
                </div>

                <div className="w-full md:w-1/2 md:px-10">
                    <div className="w-full pb-6 space-y-6 sm:max-w-md lg:max-w-lg md:space-y-4 lg:space-y-8 xl:space-y-9 sm:pr-5 lg:pr-0 md:pb-0">
                        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl md:text-4xl lg:text-5xl xl:text-6xl">
                            <span className="block xl:inline">How It <span>&nbsp;</span></span>
                            <span className="block text-indigo-600 xl:inline">Works</span>
                        </h1>
                        <div className="mx-auto text-base text-black sm:max-w-md lg:text-base md:max-w-xl">
                            <ul className="space-y-4 list-disc list-inside text-gray-800">
                                <li className="px-4 py-2 bg-gray-100 rounded-md shadow-sm">
                                    <span className="font-semibold">Create a chatbot</span>
                                </li>
                                <li className="px-4 py-2 bg-gray-100 rounded-md shadow-sm">
                                    <span className="font-semibold">Upload Your Customer Service Support Documents</span>
                                </li>
                                <li className="px-4 py-2 bg-gray-100 rounded-md shadow-sm">
                                    <span className="font-semibold">Chatbot Ready</span>
                                </li>
                                <li className="px-4 py-2 bg-gray-100 rounded-md shadow-sm">
                                    <span className="font-semibold">Call Custom URLs of your bot From Anywhere</span>
                                </li>
                                <li className="px-4 py-2 bg-gray-100 rounded-md shadow-sm">
                                    <span className="font-semibold">Use Our React Components to Connect</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

            </HeroSection>

    </div>
        </>
    );
    
};

export default Home;