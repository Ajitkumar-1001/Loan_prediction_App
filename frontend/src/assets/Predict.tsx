import React, { useState } from 'react';
import { motion } from 'framer-motion';
// Using inline SVG for icons to avoid external dependency resolution issues.

// Define the type for the input data based on your API's expected payload
interface LoanPredictionInput {
  IncomePerDependent: number;
  LoanAmount: number;
  RiskScore: number; // Added new field
  TotalDebtToIncomeRatio: number;
  InterestRate: number; // Added new field
  AnnualIncome: number;
  BaseInterestRate: number;
  // Removed Age as per user's updated features
}

// Define the type for the prediction result
interface LoanPredictionResult {
  prediction: string; // e.g., "Approved" or "Rejected"
  probability?: number; // Optional probability score
  message?: string; // Optional message from the backend
}

const Predict: React.FC = () => {
  const [formData, setFormData] = useState<LoanPredictionInput>({
    IncomePerDependent: 0, // Changed from " " to 0
    LoanAmount: 0, // Changed from " " to 0
    RiskScore: 0, // Initialized new field, changed from " " to 0
    TotalDebtToIncomeRatio: 0, // Changed from " " to 0
    InterestRate: 0, // Initialized new field, changed from " " to 0
    AnnualIncome: 0, // Changed from " " to 0
    BaseInterestRate: 0, // Changed from " " to 0
    // Age removed
  });

  const [predictionResult, setPredictionResult] = useState<LoanPredictionResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Handle input changes for numerical fields
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: parseFloat(value) || 0, // Parse as float, default to 0 if invalid
    }));
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPredictionResult(null);

    try {
      // IMPORTANT: Replace with your actual FastAPI endpoint URL for loan prediction
      // Based on the screenshot, it was 'http://127.0.0.1:8000/loan-predict-loan'
      const response = await fetch('http://127.0.0.1:8000/Loan/predict-loan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Something went wrong with the prediction.');
      }

      const data: LoanPredictionResult = await response.json();
      setPredictionResult(data);
    } catch (err: any) {
      setError(err.message || 'Failed to get prediction.');
    } finally {
      setLoading(false);
    }
  };

  // Framer Motion variants for animations
  const containerVariants = {
    hidden: { opacity:0, y:100, rotate: 90 }, // Added initial rotation
    visible: { opacity: 1, y:0, rotate: 0, transition: { duration:1.0, ease: 'easeOut' } }, // Rotates to 0 degrees
  };

  const headingvariant = {
    hidden : { opacity : 0, x:50 ,y:50},
    visible : { opacity : 1, x:0 , y: 0, transition : {duration:0.3, ease:"easeOut"}}, // Added comma here
    hover : {scale : 1.25, textShadow: '5px 5px 5px rgba(0,0,0,0.2)'}
  }

  const itemVariants=  {
        "hidden" : {opacity : 0 , x : 5 , y : 10 },
        "visible" : {opacity : 1 , x : 0 , y : 0, transition : {duration : 1.0, ease : "easeOut"}}

    }

  const buttonVariants = {
    hover: { scale: 1.05, boxShadow: '5px 5px 5px rgba(0,0,0,0.2)' },
    tap: { scale: 0.95 },
  };

  const resultVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: 'easeOut' } },
  };

  return (
    

    <div className="min-w-screen min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-sky-950 to-blue-850 ">

      

      <motion.div
        className="w-full max-w-xl bg-gradient-to-br from-sky-950 to-blue-850 rounded-2xl shadow-3xl p-8 md:p-10 border border-gray-700 mx-auto"
        variants={containerVariants as any}
        initial="hidden"
        animate="visible"
      >
        <motion.h1
          className="text-4xl font-extrabold text-center mb-8 text-zinc-400"
          variants={headingvariant as any}
        initial = "hidden"
        animate = "visible">
          Loan Prediction
        </motion.h1> {/* Corrected closing tag */}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Input Field: Income Per Dependent */}
          <motion.div variants={itemVariants as any} className="">
            <label htmlFor="IncomePerDependent" className="block text-sm font-medium text-gray-300 mb-1">
              Income Per Dependent ($)
            </label>
            <input
              type="number"
              id="IncomePerDependent"
              name="IncomePerDependent"
              value={formData.IncomePerDependent}
              onChange={handleChange}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-100 placeholder-gray-400 transition duration-200"
              placeholder="e.g., 50000"
              step="0.01"
              required
            />
          </motion.div>

          {/* Input Field: Loan Amount */}
          <motion.div variants={itemVariants as any} className="relative">
            <label htmlFor="LoanAmount" className="block text-sm font-medium text-gray-300 mb-1">
              Loan Amount ($)
            </label>
            <input
              type="number"
              id="LoanAmount"
              name="LoanAmount"
              value={formData.LoanAmount}
              onChange={handleChange}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-100 placeholder-gray-400 transition duration-200"
              placeholder="e.g., 250000"
              step="0.01"
              required
            />
          </motion.div>

          {/* Input Field: Risk Score (New Field) */}
          <motion.div variants={itemVariants as any} className="relative">
            <label htmlFor="RiskScore" className="block text-sm font-medium text-gray-300 mb-1">
              Risk Score
            </label>
            <input
              type="number"
              id="RiskScore"
              name="RiskScore"
              value={formData.RiskScore}
              onChange={handleChange}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-100 placeholder-gray-400 transition duration-200"
              placeholder="e.g., 0.35"
              step="0.01"
              required
            />
          </motion.div>

          {/* Input Field: Total Debt To Income Ratio */}
          <motion.div variants={itemVariants as any} className="relative">
            <label htmlFor="TotalDebtToIncomeRatio" className="block text-sm font-medium text-gray-300 mb-1">
              Debt-to-Income Ratio (%)
            </label>
            <input
              type="number"
              id="TotalDebtToIncomeRatio"
              name="TotalDebtToIncomeRatio"
              value={formData.TotalDebtToIncomeRatio}
              onChange={handleChange}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-100 placeholder-gray-400 transition duration-200"
              placeholder="e.g., 0.4"
              step="0.01"
              required
            />
          </motion.div>

          {/* Input Field: Interest Rate (New Field) */}
          <motion.div variants={itemVariants as any} className="relative">
            <label htmlFor="InterestRate" className="block text-sm font-medium text-gray-300 mb-1">
              Interest Rate (%)
            </label>
            <input
              type="number"
              id="InterestRate"
              name="InterestRate"
              value={formData.InterestRate}
              onChange={handleChange}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-100 placeholder-gray-400 transition duration-200"
              placeholder="e.g., 5.5"
              step="0.01"
              required
            />
          </motion.div>

          {/* Input Field: Annual Income */}
          <motion.div variants={itemVariants as any} className="relative">
            <label htmlFor="AnnualIncome" className="block text-sm font-medium text-gray-300 mb-1">
              Annual Income ($)
            </label>
            <input
              type="number"
              id="AnnualIncome"
              name="AnnualIncome"
              value={formData.AnnualIncome}
              onChange={handleChange}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-100 placeholder-gray-400 transition duration-200"
              placeholder="e.g., 750000"
              step="0.01"
              required
            />
          </motion.div>

          {/* Input Field: Base Interest Rate */}
          <motion.div variants={itemVariants as any} className="relative">
            <label htmlFor="BaseInterestRate" className="block text-sm font-medium text-gray-300 mb-1">
              Base Interest Rate (%)
            </label>
            <input
              type="number"
              id="BaseInterestRate"
              name="BaseInterestRate"
              value={formData.BaseInterestRate}
              onChange={handleChange}
              className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-gray-100 placeholder-gray-400 transition duration-200"
              placeholder="e.g., 3.5"
              step="0.01"
              required
            />
          </motion.div>

          <motion.div className="md:col-span-2 flex justify-center mt-6">
            <motion.button
              type="submit"
              className="flex items-center justify-center px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-full shadow-lg transition duration-300 ease-in-out transform active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-500 focus:ring-opacity-50"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              disabled={loading}
            >
              {loading ? (
                <svg className="animate-spin h-5 w-5 text-white mr-3" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 text-xl">
                    <path d="M22 12H2M15 5l7 7-7 7"/>
                </svg>
              )}
              {loading ? 'Predicting...' : 'Get Loan Prediction'}
            </motion.button>
          </motion.div>
        </form>

        {error && (
          <motion.div
            className="mt-8 p-4 bg-red-800 text-red-100 rounded-lg shadow-md flex items-center justify-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-2xl mr-3">
                <circle cx="12" cy="12" r="10"/>
                <path d="M15 9l-6 6M9 9l6 6"/>
            </svg>
            <p className="font-medium">Error: {error}</p>
          </motion.div>
        )}

        {predictionResult && (
          <motion.div
            className={`mt-8 p-6 rounded-lg shadow-xl text-center ${
              predictionResult.prediction === 'Approved' ? 'bg-green-700' : 'bg-red-700'
            }`}
            variants={resultVariants as any}
            initial="hidden"
            animate="visible"
          >
            <h2 className="text-3xl font-bold mb-4 flex items-center justify-center">
              {predictionResult.prediction === 'Approved' ? (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-4xl mr-3">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
                    <path d="M22 4L12 14.01l-3-3"/>
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-4xl mr-3">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M15 9l-6 6M9 9l6 6"/>
                </svg>
              )}
              Loan Status: {predictionResult.prediction}
            </h2>
          
            {predictionResult.message && (
              <p className="text-lg text-gray-200">{predictionResult.message}</p>
            )}
          </motion.div>
        )}
      </motion.div>
    </div>
    
  );
};

export default Predict;
