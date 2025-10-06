import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { securePost } from '../../utils/api';


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
  const PREDICT_SESSION_KEY = 'predict_form_session';
  const SESSION_DURATION = 3 * 60 * 1000; // 3 minutes in milliseconds

  const [formData, setFormData] = useState<LoanPredictionInput>({
    IncomePerDependent: "",
    LoanAmount: "",
    RiskScore: "",
    TotalDebtToIncomeRatio: "",
    InterestRate: "",
    AnnualIncome: "",
    BaseInterestRate: "",
  });

  const [predictionResult, setPredictionResult] = useState<LoanPredictionResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  // const noteref = useRef<HTMLDivElement|null>(null);
  const [note, setNote] = useState<boolean>(true);
  const [showCalculatorModal, setShowCalculatorModal] = useState<boolean>(false);
  const [calculatorType, setCalculatorType] = useState<'riskScore' | 'debtRatio' | null>(null);

  // Calculator form states
  const [calculatorData, setCalculatorData] = useState({
    // For Risk Score
    totalAssets: "",
    totalLiabilities: "",
    creditScore: "",
    monthlyIncome: "",
    // For Debt to Income Ratio
    totalMonthlyDebt: "",
    grossMonthlyIncome: "",
  });

  // Load form data from localStorage on mount
  useEffect(() => {
    const loadFormSession = () => {
      try {
        const savedSession = localStorage.getItem(PREDICT_SESSION_KEY);
        if (savedSession) {
          const { formData: savedFormData, predictionResult: savedResult, timestamp } = JSON.parse(savedSession);
          const currentTime = new Date().getTime();

          // Check if session is still valid (within 3 minutes)
          if (currentTime - timestamp < SESSION_DURATION) {
            setFormData(savedFormData);
            if (savedResult) {
              setPredictionResult(savedResult);
            }
          } else {
            // Session expired, clear it
            localStorage.removeItem(PREDICT_SESSION_KEY);
          }
        }
      } catch (error) {
        console.error('Error loading form session:', error);
        localStorage.removeItem(PREDICT_SESSION_KEY);
      }
    };

    loadFormSession();
  }, [PREDICT_SESSION_KEY, SESSION_DURATION]);

  // Save form data to localStorage whenever it changes
  useEffect(() => {
    const hasData = Object.values(formData).some(val => val !== "");

    if (hasData) {
      try {
        const sessionData = {
          formData,
          predictionResult,
          timestamp: new Date().getTime()
        };
        localStorage.setItem(PREDICT_SESSION_KEY, JSON.stringify(sessionData));
      } catch (error) {
        console.error('Error saving form session:', error);
      }
    }
  }, [formData, predictionResult]);

  // Clear expired sessions periodically
  useEffect(() => {
    const intervalId = setInterval(() => {
      try {
        const savedSession = localStorage.getItem(PREDICT_SESSION_KEY);
        if (savedSession) {
          const { timestamp } = JSON.parse(savedSession);
          const currentTime = new Date().getTime();

          if (currentTime - timestamp >= SESSION_DURATION) {
            localStorage.removeItem(PREDICT_SESSION_KEY);
            setFormData({
              IncomePerDependent: "",
              LoanAmount: "",
              RiskScore: "",
              TotalDebtToIncomeRatio: "",
              InterestRate: "",
              AnnualIncome: "",
              BaseInterestRate: "",
            });
            setPredictionResult(null);
          }
        }
      } catch (error) {
        console.error('Error checking session expiry:', error);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(intervalId);
  }, [PREDICT_SESSION_KEY, SESSION_DURATION]);

  // Hide Quick Tips and Note when user fills form or gets prediction
  useEffect(() => {
    const hasFormData = Object.values(formData).some(val => val !== "" && val !== 0);
    const hasPrediction = predictionResult !== null;

    if ((hasFormData || hasPrediction) && note) {
      setNote(false);
    }
  }, [formData, predictionResult, note]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value === "" ? "" : parseFloat(value),
    }));
  };

  const handleCalculatorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setCalculatorData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const openCalculator = (type: 'riskScore' | 'debtRatio') => {
    setCalculatorType(type);
    setShowCalculatorModal(true);
    setCalculatorData({
      totalAssets: "",
      totalLiabilities: "",
      creditScore: "",
      monthlyIncome: "",
      totalMonthlyDebt: "",
      grossMonthlyIncome: "",
    });
  };

  const calculateRiskScore = async () => {
    try {
      const data = await securePost('/api/Loan/calculate-risk-score', {
        totalAssets: parseFloat(calculatorData.totalAssets),
        totalLiabilities: parseFloat(calculatorData.totalLiabilities),
        creditScore: parseFloat(calculatorData.creditScore),
        monthlyIncome: parseFloat(calculatorData.monthlyIncome),
      });
      setFormData(prev => ({ ...prev, RiskScore: data.riskScore }));
      setShowCalculatorModal(false);
    } catch (err) {
      const error = err as Error;
      alert(error.message || "Failed to calculate risk score");
    }
  };

  const calculateDebtRatio = async () => {
    try {
      const data = await securePost('/api/Loan/calculate-debt-ratio', {
        totalMonthlyDebt: parseFloat(calculatorData.totalMonthlyDebt),
        grossMonthlyIncome: parseFloat(calculatorData.grossMonthlyIncome),
      });
      setFormData(prev => ({ ...prev, TotalDebtToIncomeRatio: data.debtRatio }));
      setShowCalculatorModal(false);
    } catch (err) {
      const error = err as Error;
      alert(error.message || "Failed to calculate debt ratio");
    }
  };

  const handleCalculatorSubmit = () => {
    if (calculatorType === 'riskScore') {
      calculateRiskScore();
    } else if (calculatorType === 'debtRatio') {
      calculateDebtRatio();
    }
  };

  const isFormValid = useCallback(() => {
    return Object.values(formData).every(
      (val) => typeof val === "number" && !isNaN(val) && val > 0
    );
  },[formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setPredictionResult(null);

    if (!isFormValid()) {
      setError("Please fill in all fields with valid non-zero values.");
      return;
    }

    setLoading(true);

    try {
      // Use secure API request with authentication
      const data: LoanPredictionResult = await securePost('/api/Loan/predict-loan', formData);
      setPredictionResult(data);
    } catch (err) {
      const error = err as Error;
      setError(error.message || "Failed to get prediction.");
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
  }, [location.pathname, predictionResult?.llm_response, control1, control2, control3]);

  const containervariantllm = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.2 } },
  }), []);

  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0, y: 100},
    visible: {
      opacity: 1,
      y: 0,
      // rotate: 0,
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

  const quickTipsVariants = useMemo(() => ({
    initial: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50, transition: { duration: 0.4 } }
  }), []);



  return (
    <div className="min-w-screen min-h-screen flex flex-col md:flex-row gap-6 items-center justify-center bg-gradient-to-br from-sky-950 to-sky-900">


      <div className="flex flex-row gap-8 items-center m-3">


        <AnimatePresence>
          {note && (
            <motion.div
              variants={quickTipsVariants}
              initial="initial"
              exit="exit"
              className="flex flex-col items-center gap-6 mt-4 mx-3 max-w-md"
            >
            {/* Header */}
            <div className="w-full text-center mb-2">
              <div className="inline-block px-5 py-2 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-full border border-cyan-500/30 backdrop-blur-sm mb-3">
                <span className="text-cyan-400 font-semibold text-sm tracking-wider">💡 HELPFUL TIPS</span>
              </div>
              <h2 className="text-3xl font-black bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                Quick Tips
              </h2>
            </div>

            {/* Tip Cards */}
            <div className="w-full space-y-4">
              {/* Risk Score Tip */}
              <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-cyan-500/30 p-5 transition-all duration-300 group-hover:border-cyan-500/50">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">📊</span>
                    </div>
                    <div className="flex-1">
                      <h6 className="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">
                        Risk Score
                      </h6>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        A numerical estimate of your financial reliability, calculated using income, assets, liabilities, and credit history to assess loan repayment likelihood.
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 p-3 bg-cyan-500/10 rounded-lg border border-cyan-500/20">
                    <p className="text-xs text-cyan-300 font-semibold">
                      🧮 Don't know your score? Use our calculator! Our ML model provides predictions close to the true value.
                    </p>
                  </div>
                </div>
              </div>

              {/* Income Per Dependent Tip */}
              <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-sky-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-blue-500/30 p-5 transition-all duration-300 group-hover:border-blue-500/50">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-sky-600 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">👨‍👩‍👧‍👦</span>
                    </div>
                    <div className="flex-1">
                      <h6 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-sky-400 bg-clip-text text-transparent mb-2">
                        Income Per Dependent
                      </h6>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        Your total income divided by the number of dependents. This shows how your income is distributed among family members.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interest Rate Tip */}
              <div className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-sky-500 to-cyan-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-300"></div>
                <div className="relative bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-sky-500/30 p-5 transition-all duration-300 group-hover:border-sky-500/50">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-sky-500 to-cyan-600 rounded-xl flex items-center justify-center">
                      <span className="text-2xl">💰</span>
                    </div>
                    <div className="flex-1">
                      <h6 className="text-lg font-bold bg-gradient-to-r from-sky-400 to-cyan-400 bg-clip-text text-transparent mb-2">
                        Interest Rate
                      </h6>
                      <p className="text-sm text-gray-300 leading-relaxed">
                        Check your bank's official website for current interest rates. Federal policy restricts direct access to official bank rates.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          )}
        </AnimatePresence>


        <motion.div
          className="w-full max-w-xl bg-gradient-to-br from-sky-950 to-blue-850 rounded-2xl p-8 md:p-10 border border-gray-700 mx-auto shadow-lg"
          // @ts-ignore - Framer Motion variant type issue
          variants={containerVariants}
          initial="hidden"
          animate={control1}
        >
          <motion.h1
            className="text-2xl font-extrabold text-center mb-8 bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent"
            // @ts-ignore - Framer Motion variant type issue
            variants={headingvariant}
          >
            Loan Prediction
          </motion.h1>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(formData).map(([key, value]) => (
              <motion.div key={key} variants={itemVariants as any}>
                <label htmlFor={key} className="block text-sm font-sans font-bold text-center font-medium text-gray-300 mb-1">
                  {key.replace(/([A-Z])/g, ' $1')}
                </label>
                <div className="relative">
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
                  {(key === 'RiskScore' || key === 'TotalDebtToIncomeRatio') && (
                    <button
                      type="button"
                      onClick={() => openCalculator(key === 'RiskScore' ? 'riskScore' : 'debtRatio')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 px-5 py-1 bg-cyan-600 hover:bg-cyan-700 text-white text-xs font-bold rounded-md transition duration-200"
                    >
                      🧮 Calc
                    </button>
                  )}
                </div>
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

      {/* Calculator Modal */}
      <AnimatePresence>
        {showCalculatorModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
            onClick={() => setShowCalculatorModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="bg-gradient-to-br from-slate-900 to-blue-900 rounded-2xl p-8 max-w-md w-full border border-cyan-500/30 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                  {calculatorType === 'riskScore' ? 'Risk Score Calculator' : 'Debt Ratio Calculator'}
                </h3>
                <button
                  onClick={() => setShowCalculatorModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Form */}
              <div className="space-y-4">
                {calculatorType === 'riskScore' ? (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Total Assets ($)</label>
                      <input
                        type="number"
                        name="totalAssets"
                        value={calculatorData.totalAssets}
                        onChange={handleCalculatorChange}
                        className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-cyan-500 focus:border-cyan-500 text-gray-100 placeholder-gray-500"
                        placeholder="Enter total assets"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Total Liabilities ($)</label>
                      <input
                        type="number"
                        name="totalLiabilities"
                        value={calculatorData.totalLiabilities}
                        onChange={handleCalculatorChange}
                        className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-cyan-500 focus:border-cyan-500 text-gray-100 placeholder-gray-500"
                        placeholder="Enter total liabilities"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Credit Score</label>
                      <input
                        type="number"
                        name="creditScore"
                        value={calculatorData.creditScore}
                        onChange={handleCalculatorChange}
                        className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-cyan-500 focus:border-cyan-500 text-gray-100 placeholder-gray-500"
                        placeholder="Enter credit score (300-850)"
                        min="300"
                        max="850"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Monthly Income ($)</label>
                      <input
                        type="number"
                        name="monthlyIncome"
                        value={calculatorData.monthlyIncome}
                        onChange={handleCalculatorChange}
                        className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-cyan-500 focus:border-cyan-500 text-gray-100 placeholder-gray-500"
                        placeholder="Enter monthly income"
                        step="0.01"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Total Monthly Debt ($)</label>
                      <input
                        type="number"
                        name="totalMonthlyDebt"
                        value={calculatorData.totalMonthlyDebt}
                        onChange={handleCalculatorChange}
                        className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-cyan-500 focus:border-cyan-500 text-gray-100 placeholder-gray-500"
                        placeholder="Enter total monthly debt"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-300 mb-2">Gross Monthly Income ($)</label>
                      <input
                        type="number"
                        name="grossMonthlyIncome"
                        value={calculatorData.grossMonthlyIncome}
                        onChange={handleCalculatorChange}
                        className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg focus:ring-cyan-500 focus:border-cyan-500 text-gray-100 placeholder-gray-500"
                        placeholder="Enter gross monthly income"
                        step="0.01"
                      />
                    </div>
                  </>
                )}

                {/* Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCalculatorModal(false)}
                    className="flex-1 px-4 py-3 bg-gray-700 hover:bg-gray-600 text-white font-bold rounded-lg transition duration-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCalculatorSubmit}
                    className="flex-1 px-4 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700 text-white font-bold rounded-lg transition duration-200"
                  >
                    Calculate
                  </button>
                </div>
              </div>

              {/* Info */}
              <div className="mt-6 p-4 bg-cyan-900/30 border border-cyan-500/30 rounded-lg">
                <p className="text-xs text-gray-400">
                  {calculatorType === 'riskScore'
                    ? 'Our ML model will predict your risk score based on your financial indicators.'
                    : 'The debt-to-income ratio is calculated by dividing total monthly debt by gross monthly income.'}
                </p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default Predict;