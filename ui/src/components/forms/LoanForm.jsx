import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { DollarSign, Calendar, Percent } from 'lucide-react';

export default function LoanForm({ customerId, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [emi, setEmi] = useState(0);
  const { register, handleSubmit, watch, formState: { errors } } = useForm();

  const principal = watch('principal');
  const interestRate = watch('interestRate');
  const tenure = watch('tenure');

  useEffect(() => {
    if (!customerId) {
      fetchCustomers();
    }
  }, [customerId]);

  useEffect(() => {
    if (principal && interestRate && tenure) {
      calculateEMI();
    }
  }, [principal, interestRate, tenure]);

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/borrowers', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await response.json();
      setCustomers(data.borrowers || []);
    } catch (error) {
      console.error('Failed to fetch customers:', error);
    }
  };

  const calculateEMI = () => {
    const P = parseFloat(principal);
    const r = parseFloat(interestRate) / 100 / 12;
    const n = parseInt(tenure);
    
    if (P && r && n) {
      const emiAmount = (P * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
      setEmi(Math.round(emiAmount));
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await fetch('/api/loans', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          borrower: customerId || data.borrower,
          principal: parseFloat(data.principal),
          interestRate: parseFloat(data.interestRate),
          tenure: parseInt(data.tenure),
          emi: emi,
          processingFee: parseFloat(data.processingFee) || 0
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create loan');
      }

      const loan = await response.json();
      toast.success('Loan created successfully!');
      onSuccess?.(loan);
    } catch (error) {
      toast.error(error.message || 'Failed to create loan');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Create New Loan</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {!customerId && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Customer *</label>
            <select
              {...register('borrower', { required: 'Customer is required' })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select Customer</option>
              {customers.map(customer => (
                <option key={customer._id} value={customer._id}>
                  {customer.personalInfo.firstName} {customer.personalInfo.lastName} - {customer.contact.phone}
                </option>
              ))}
            </select>
            {errors.borrower && <p className="text-sm text-red-600 mt-1">{errors.borrower.message}</p>}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Loan Amount *"
            type="number"
            leftIcon={<DollarSign className="h-5 w-5" />}
            {...register('principal', { required: 'Loan amount is required', min: 1 })}
            error={errors.principal?.message}
          />
          <Input
            label="Interest Rate (% per annum) *"
            type="number"
            step="0.01"
            leftIcon={<Percent className="h-5 w-5" />}
            {...register('interestRate', { required: 'Interest rate is required', min: 0 })}
            error={errors.interestRate?.message}
          />
          <Input
            label="Tenure (months) *"
            type="number"
            leftIcon={<Calendar className="h-5 w-5" />}
            {...register('tenure', { required: 'Tenure is required', min: 1 })}
            error={errors.tenure?.message}
          />
          <Input
            label="Processing Fee"
            type="number"
            leftIcon={<DollarSign className="h-5 w-5" />}
            {...register('processingFee')}
          />
        </div>

        {emi > 0 && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-medium text-blue-900 mb-2">EMI Calculation</h3>
            <p className="text-2xl font-bold text-blue-700">₹{emi.toLocaleString()}</p>
            <p className="text-sm text-blue-600">Monthly EMI Amount</p>
          </div>
        )}

        <div className="flex gap-4 pt-6 border-t">
          <Button
            type="submit"
            loading={loading}
            className="flex-1"
          >
            Create Loan
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1"
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}