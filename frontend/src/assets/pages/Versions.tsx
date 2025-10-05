import React from "react";


const Versions: React.FC = () => {


    return (

        <div className="min-w-screen min-h-screen  bg-gradient-to-tr from-sky-950 to-sky-900">
            <h2 className="py-[8rem] text-2xl font-sans font-bold text-center bg-gradient-to-tr from-cyan-500 to-blue-500 bg-clip-text text-transparent">Versions</h2>
            <div className="relative flex flex-col items-center justify-center  p-2">
                <div className="absolute mx-auto inset-0 z-0 bg-gradient-to-tr from-blue-500 to-sky-700 brightness-200 w-[73rem] rounded-[18px] animate-pulse opacity-80"></div>
                <div className=" relative max-w-6xl bg-black/100 backdrop-blur-md w-full p-1 mx-auto border-2 rounded-xl shadow-2xl">
                    <h3 className=" relative mt-2 p-2 text-2xl font-sans font-bold text-center bg-gradient-to-tr from-gray-400 to-cyan-500 bg-clip-text text-transparent">Version 1</h3>
                    <p className="relative space-y-5 text-xl font-sans font-bold text-center bg-gradient-to-bl from-gray-400 to-white bg-clip-text text-transparent capitalize leading-relaxed "> The version 1 of the smartloanpred has been introduced only with the loan prediction form that has the required fields to calculate the loan approval rate using the machine learning algorithms!</p>
                </div>
            </div>

            <div className="relative flex flex-col items-center justify-center space-y-5">
                <div className="absolute h-[14.5rem] z-0 inset-3 bg-gradient-to-tr from-cyan-800 to-blue-900 rounded-[18px] animate-pulse w-[73rem] brightness-200 mx-auto"></div>
                    <div className=" relative max-w-6xl bg-black/100 backdrop-blur-lg w-full p-3 mx-auto border-2 rounded-xl shadow-2xl mt-5">
                        <h3 className="relative mt-2 p-2 text-2xl font-sans font-bold text-center bg-gradient-to-tr from-gray-400 to-cyan-500 bg-clip-text text-transparent">Version 2</h3>
                        <p className="relative space-y-5 text-xl font-sans font-bold text-center bg-gradient-to-bl from-gray-400 to-white bg-clip-text text-transparent capitalize leading-relaxed "> The version 2 has been improvized with Login and sign-up features for authorized usage of the tool <br></br>
                            In this version, we have also introduced additional features to make the model more domain specific as well to maintain a clean predictions, also reinforced with regression model to predict and calculate the Risk score and other fields that are unknown to the user!</p>
                    </div>
                
            </div>

        </div>


    );
};

export default Versions;