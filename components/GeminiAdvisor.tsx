import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import { CalculationResult, SalaryInputs } from '../types';

interface Props {
  results: CalculationResult;
  inputs: SalaryInputs;
}

const GeminiAdvisor: React.FC<Props> = ({ results, inputs }) => {
  const [loading, setLoading] = useState(false);
  const [advice, setAdvice] = useState<string | null>(null);

  const getAdvice = async () => {
    if (!process.env.API_KEY) {
      setAdvice("API Key not configured. Please add your Gemini API Key.");
      return;
    }

    setLoading(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const prompt = `
        You are a helpful financial assistant for a Canadian worker.
        Here is their payroll data:
        - Province: ${inputs.province}
        - Hourly Wage: $${inputs.hourlyWage}
        - Bi-Weekly Net Pay: $${results.netPayBiWeekly.toFixed(2)}
        - Annual Gross Income: $${results.grossPayAnnual.toFixed(2)}
        - Annual Net Income: $${results.netPayAnnual.toFixed(2)}
        - Working Hours (Bi-weekly): ${(results.regularHours + results.overtimeHours15 + results.overtimeHours20).toFixed(1)}

        Please provide a concise analysis (max 3 paragraphs) covering:
        1. How this income compares to the cost of living in ${inputs.province} (general sentiment).
        2. A brief tip on tax optimization or savings based on this bracket.
        3. If there is overtime, is it significant?

        Keep it friendly and professional. Use formatting like bullet points.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      setAdvice(response.text || "Could not generate advice at this time.");
    } catch (error) {
      console.error(error);
      setAdvice("Sorry, I encountered an error analyzing your data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800 rounded-xl shadow-lg p-6 text-white mt-6 border-l-4 border-red-500">
      <div className="flex items-start gap-4">
        <div className="p-3 bg-slate-700 rounded-lg">
          <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
        </div>
        <div className="flex-1">
          <h3 className="text-xl font-bold mb-2">AI Salary Insights</h3>
          <p className="text-slate-300 text-sm mb-4">
            Ask Gemini to analyze your earnings against the cost of living in {inputs.province} and provide financial tips.
          </p>
          
          {!advice && !loading && (
            <button 
              onClick={getAdvice}
              className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 transition-colors shadow-lg shadow-red-900/50"
            >
              Analyze My Pay
            </button>
          )}

          {loading && (
             <div className="flex items-center space-x-2 text-red-300 animate-pulse">
               <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce"></div>
               <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce delay-75"></div>
               <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce delay-150"></div>
               <span>Analyzing with Gemini...</span>
             </div>
          )}

          {advice && (
            <div className="bg-slate-700/50 p-4 rounded-lg text-sm leading-relaxed border border-slate-600">
               <div dangerouslySetInnerHTML={{ __html: advice.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong class="text-red-300">$1</strong>') }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GeminiAdvisor;