import React from "react";


const Policy: React.FC = () => {


    return (

        <div className="min-h-screen min-w-screen flex flex-col items-center justify-center md:flex-col bg-gradient-to-br from-sky-950 to-sky-900 ">
            <div className="flex flex-col md:flex-col items-center justify-center mx-auto p-15 space-y-15  mt-3">
                <h2 className="text-3xl font-sans font-extrabold bg-gradient-to-tr from-cyan-600 to-blue-400 bg-clip-text text-transparent mx-auto text-center mt-4 p-1"> Our Policy</h2>

                <div className=" flex flex-col items-center mt-2 gap-10">
                    {/* <div className="absolute h-24 z-0 inset-0 bg-gradient-to-t from-blue-500 to-blue-800 w-full rounded-[18px] animate-pulse-slow brightness-200"></div> */}
                    <div className=" max-w-5xl w-full mt-2 p-3 bg-black/50 backdrop-blur-lg rounded-2xl border border-gray-100 mx-auto">
                        <h3 className=" text-xl font-sans  text-center text-gray-100 brightness-150">
                            This app is completely stateless and no data has been transfered or stored internally for research purpose, may be in future with improvements,
                            it can implemented only if the user agrees by checking out the check box !,
                        </h3>
                    </div>
                    <div className=" flex flex-col items-center mt-2 gap-10">
                        {/* <div className="absolute h-24 w-full z-0 inset-0 bg-gradient-to-tr from-blue-500 to-blue-900 rounded-[18px] animate-pulse-slow brightness-200"></div> */}
                        <div className="max-w-5xl w-full mt-2 p-3 bg-black/50 backdrop-blur-lg rounded-2xl border border-gray-100 mx-auto">
                            <h3 className="text-xl font-sans text-center text-gray-100 brightness-150">
                                This is a <span className="font-sans font-bold bg-gradient-to-tr from-cyan-500 to-blue-500 bg-clip-text text-transparent">Full-stack ML app</span>, which has <span className="font-sans font-bold capitalize bg-gradient-to-tr from-cyan-500 to-blue-500 bg-clip-text text-transparent">supervised learning</span> tasks such as classification and prediciton of the outcomes, this predicts the  <span className="font-sans font-bold capitalize bg-gradient-to-tr from-cyan-500 to-blue-500 bg-clip-text text-transparent">risk score</span> by collecting the user's financial entries!
                            </h3>
                        </div>
                    </div>

                    {/* <div className="max-w-5xl w-full mt-2 p-3 bg-gradient-to-r from-white-900 via-gray-700 to-black-500  rounded-2xl border border-gray-100 mx-auto">
                        <h3 className="text-xl font-sans  text-center text-gray-100 brightness-150">
                            The version 2 of this app has been introduced with Ensemble learning regression techniques to introduce the prediction of the Financial data <br></br>
                            This predicts your CIBIL score, you dont have to visit or use any tool to know this !,this app has been integrated with Machine learning methods determing the output <br></br>
                            By feature selection technique with a minimal inputs we get a almost accurate score! again these are not your official CIBIL score since we value your data, we just augment a CIBIL score <br></br>
                        </h3>
                    </div>

                    <div className="max-w-5xl w-full mt-2 p-3 bg-gradient-to-r from-white-900 via-gray-700 to-black-500  rounded-2xl border  border-gray-100 mx-auto">
                        <h3 className="text-xl font-sans text-center text-gray-100 brightness-150">
                            The version 3 of this app may bring up with more powerful advancements such as a cache server and cloud setup for database to store and process the data and display the insights, <br></br>
                            Might add up customer segmentation based on the loan approval rates and the credit score <br></br>
                            May tie up with banks and integrate this tool and serve their customers from their bank site itself <br></br>
                        </h3>
                    </div> */}

                </div>
            </div>
        </div>


    );
};

export default Policy;