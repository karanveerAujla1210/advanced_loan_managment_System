import React, { useState } from 'react';
import Step1Borrower from './Step1Borrower';
import Step2Product from './Step2Product';
import Step3Schedule from './Step3Schedule';
import Step4Review from './Step4Review';

export default function LoanCreateWizard() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({ borrowerId: '', productId: '', amount: '', tenure: '' });
  const [schedule, setSchedule] = useState([]);

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex justify-between mb-6">
          {[1, 2, 3, 4].map(s => (
            <div key={s} className={`flex-1 h-2 rounded ${s <= step ? 'bg-blue-600' : 'bg-gray-200'}`} />
          ))}
        </div>

        {step === 1 && <Step1Borrower formData={formData} setFormData={setFormData} borrowers={[]} />}
        {step === 2 && <Step2Product formData={formData} setFormData={setFormData} products={[]} />}
        {step === 3 && <Step3Schedule schedule={schedule} />}
        {step === 4 && <Step4Review formData={formData} borrower={null} product={null} />}

        <div className="flex justify-between mt-6">
          {step > 1 && <button onClick={prevStep} className="px-4 py-2 border rounded">Back</button>}
          {step < 4 && <button onClick={nextStep} className="px-4 py-2 bg-blue-600 text-white rounded ml-auto">Next</button>}
          {step === 4 && <button className="px-4 py-2 bg-green-600 text-white rounded ml-auto">Submit</button>}
        </div>
      </div>
    </div>
  );
}
