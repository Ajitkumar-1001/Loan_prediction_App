import React, { useState, useEffect, useMemo } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';


interface LoanPredictionInput {
  IncomePerDependent: string | number;
  LoanAmount: string | number;
  RiskScore: string | number;
  TotalDebtToIncomeRatio: string | number;
  InterestRate: string | number;
  AnnualIncome: string | number;
  BaseInterestRate: string | number;
}

interface LoanPredictionResult {
  prediction: string;
  message?: string;
  llm_response?: string;
}

const Predict: React.FC = () => {
  const [formData, setFormData] = useState<LoanPredictionInput>({
    IncomePerDependent: "",
    LoanAmount: "",
    RiskScore: "",
    TotalDebtToIncomeRatio: "",
    InterestRate: "",
    AnnualIncome: "",
    BaseInterestRate: "",
  } as any);

  const [predictionResult, setPredictionResult] = useState<LoanPredictionResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  // const noteref = useRef<HTMLDivElement|null>(null);
  const [note, setNote] = useState<boolean>(true)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value === "" ? "" : parseFloat(value),
    }));
  };

  const isFormValid = () => {
    return Object.values(formData).every(
      (val) => typeof val === "number" && !isNaN(val) && val > 0
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPredictionResult(null);
    setNote(false);

    if (!isFormValid()) {
      setError("Please fill in all fields with valid non-zero values.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:8000/api/Loan/predict-loan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Something went wrong with the prediction.");
      }

      const data: LoanPredictionResult = await response.json();
      setPredictionResult(data);
    } catch (err: any) {
      setError(err.message || "Failed to get prediction.");
    } finally {
      setLoading(false);
    }
  };

  const control1 = useAnimation();
  const control2 = useAnimation();
  const control3 = useAnimation();


  const location = useLocation();
  useEffect(() => {
    const sequence = async () => {

      if (location.pathname === "/predict") {
        await control1.start("visible");
        await new Promise((res) => setTimeout(res, 100));

        await control2.start("visible");
        await new Promise((res) => setTimeout(res, 50));

        await control3.start("visible");
        await new Promise((res) => setTimeout(res, 50));


        if (predictionResult?.llm_response) {
          await new Promise((res) => setTimeout(res, 1000));
        }
      };
    };

    sequence();
  }, [location.pathname, predictionResult?.llm_response]);

  const containervariantllm: Record<string, any> = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  }), []);

  // const paravariantllm: Record<string, any> = useMemo(() => ({
  //   hidden: { opacity: 0 },
  //   visible: { opacity: 1, transition: { duration: 0.5, ease: "easeIn" } },
  // }), []);

  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0, y: 100, rotate: 360 },
    visible: {
      opacity: 1,
      y: 0,
      rotate: 0,
      transition: { delay: 0.5, duration: 1.0, ease: 'easeOut', staggerChildren: 0.2 }
    }
  }), []);


  const headingvariant = useMemo(() => ({
    hidden: { opacity: 0, x: 50, y: 50 },
    visible: { opacity: 1, x: 0, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
    hover: { scale: 1.25, textShadow: '5px 5px 5px rgba(0,0,0,0.2)' }
  }), []);

  const itemVariants = useMemo(() => ({
    hidden: { opacity: 0, x: 5, y: 10 },
    visible: { opacity: 1, x: 0, y: 0, transition: { duration: 1.0, ease: 'easeOut', staggerchildren: 0.1 } }
  }), []);

  const buttonVariants = useMemo(() => ({
    hover: { scale: 1.05, boxShadow: '5px 5px 5px rgba(0,0,0,0.2)' },
    tap: { scale: 0.95 },
  }), []);

  const resultVariants = useMemo(() => ({
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
  }), []);



  return (
    <div className="min-w-screen min-h-screen flex flex-col md:flex-row gap-6 items-center justify-center bg-gradient-to-br from-sky-950 to-blue-350">


      <div className="flex flex-row gap-8 items-center m-3">


        {note && (
          <div className="flex flex-col items-center gap-4 mt-4 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-3xl mx-3 p-6 shadow-md">
            <h5 className="text-2xl font-bold text-black">Quick Tips!</h5>

            <div className="w-full max-w-3xl bg-gradient-to-r from-yellow-300 to-blue-300 rounded-2xl shadow-md p-6">
              <h6 className="text-lg font-bold text-black mb-2">Risk Score!</h6>
              <p className="text-sm font-medium text-black leading-relaxed">
                It is a special metric unlike CIBIL score. Most users mix up the terms Risk Score and CIBIL score. Risk Score is calculated from accountancy metrics and plays an important role in determining your success rate of loan approval.
              </p>
              <h4 className='text-xl font-sans font-bold text-black'>Don't Know your Scores! <span className='text-lg font-sans font-bold text-green'>No worries</span> Use our Calc page to know your scores!
              </h4>
            </div>

            <div className="w-full max-w-3xl bg-gradient-to-r from-yellow-300 to-blue-300 rounded-2xl shadow-md p-6">
              <h6 className="text-lg font-bold text-black mb-2">Income !!</h6>
              <p className="text-sm font-medium text-black leading-relaxed"> We ask Income from customer since it is a predominant factor in determining the credit eligibility of one!, we have Income PER dependent which is the applicant's annual income, In some cases,if the Applicant's income rate is Low,we ask for Family Income to support the chances of Loan Approval.
              </p>
            </div>

            <div className="w-full max-w-3xl bg-gradient-to-r from-yellow-300 to-blue-300 rounded-2xl shadow-md p-6">
              <h6 className="text-lg font-bold text-black mb-2">Interest Rate!</h6>
              <p className="text-sm font-medium text-black leading-relaxed">
                As per the Federal Policy, we cant access the Interest Rates from the Banks officially, Please be aware of the Interest Rates according to the Loan type you seek from the Bank's official or the Bank's Offical Website
              </p>
            </div>
          </div>
        )}


        <motion.div
          className="w-full max-w-xl bg-gradient-to-br from-sky-950 to-blue-850 rounded-2xl p-8 md:p-10 border border-gray-700 mx-auto shadow-lg"
          variants={containerVariants as any}
          initial="hidden"
          animate={control1}
        >
          <motion.h1
            className="text-2xl font-extrabold text-center mb-8 bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent"
            variants={headingvariant as any}
          >
            Loan Prediction
          </motion.h1>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(formData).map(([key, value]) => (
              <motion.div key={key} variants={itemVariants as any}>
                <label htmlFor={key} className="block text-sm font-sans font-bold text-center font-medium text-gray-300 mb-1">
                  {key.replace(/([A-Z])/g, ' $1')}
                </label>
                <input
                  type="number"
                  id={key}
                  name={key}
                  value={value}
                  placeholder={(() => {
                    switch (key) {
                      case "AnnualIncome":
                        return "Total Annual Income"
                      case "IncomePerDependent":
                        return "Annual Income of Applicant";
                      case "LoanAmount":
                        return "Enter Loan Amount";
                      case "RiskScore":
                        return "Calculate from Calc";
                      case "InterestRate":
                        return "Highest floating rate"
                      case "BaseInterestRate":
                        return "Base floating rate";
                      case "TotalDebtToIncomeRatio":
                        return "Calculate from Calc";
                      default:
                        return `Enter ${key.replace(/([A-Z])/g, " $1")}`;
                    }
                  })()}
                  onChange={handleChange}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-100 placeholder-gray-400 transition duration-200"
                  step="0.01"
                  min="0"
                />
              </motion.div>
            ))}

            <motion.div className="md:col-span-2 flex justify-center mt-6">
              <motion.button
                type="submit"
                className="flex items-center justify-center px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full shadow-md transition duration-300 ease-in-out transform active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
                disabled={loading}
              >
                {loading ? 'Predicting...' : 'Get Loan Prediction'}
              </motion.button>
            </motion.div>
          </form>

          {error && (
            <motion.div
              className="mt-8 p-4 bg-red-800 text-red-100 rounded-lg shadow-md"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <p className="font-medium">Error: {error}</p>
            </motion.div>
          )}

          {predictionResult && (
            <motion.div
              className={`mt-8 p-6 rounded-lg shadow-xl text-center ${predictionResult.prediction === 'Approved' ? 'bg-green-700' : 'bg-red-700'}`}
              variants={resultVariants as any}
              initial="hidden"
              animate="visible"
            >
              <h2 className="text-3xl font-bold mb-4">Loan Status: {predictionResult.prediction}</h2>
              {predictionResult.message && (
                <p className="text-lg text-gray-200">{predictionResult.message}</p>
              )}
            </motion.div>
          )}
        </motion.div>


      </div>


      {predictionResult?.llm_response && (
        <motion.div
          className="flex flex-col justify-evenly mt-30 mb-20 max-w-xl from-sky-650 to-blue-850 p-6 rounded-xl border border-gray-700 text-gray-100 font-sans font-bold shadow-lg "
          initial="hidden"
          animate="visible"
          variants={containervariantllm}
        >
          <motion.h3
            className="text-xl font-semibold text-center bg-gradient-to-br from-cyan-500 to-blue-500 bg-clip-text text-transparent"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            Suggestions
          </motion.h3>

          <div className="flex max-w-4xl w-full mt-8 flex-col gap-2">
            {predictionResult.llm_response.split('\n').map((line, index) => (
              <motion.p
                key={index}
                className="text-sm font-sans font-bold text-gray-100 brightness-120 whitespace-pre-wrap"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.35, duration: 0.5 }}
              >
                {line}
              </motion.p>
            ))}
          </div>
        </motion.div>
      )}

      <div className='absolute flex flex-col mt-[52rem]  z-0 items-center'>
        <AnimatePresence>
          {note && (
            <motion.div
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="w-full md:w-96 bg-gradient-to-br from-yellow-300 to-yellow-600 rounded-2xl shadow-md p-6 border-gray-700 overflow-y-auto "
            >
              <h2 className="text-lg font-bold text-black mb-2 text-center">Note:</h2>
              <p className="text-sm font-medium text-black text-center leading-relaxed">
                We respect your privacy and None of your data is stored internally or shared to your bank. It’s completely stateless and transparent!
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

    </div>
  );
};

export default Predict;