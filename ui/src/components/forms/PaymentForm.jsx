import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { DollarSign, CreditCard, User } from 'lucide-react';

export default function PaymentForm({ loanId, onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/loans/${loanId}/payments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          amount: parseFloat(data.amount),
          paymentMode: data.paymentMode,
          agent: data.agent,
          remarks: data.remarks,
          transactionId: data.transactionId
        })
      });

      if (!response.ok) {
        throw new Error('Failed to record payment');
      }

      const payment = await response.json();
      toast.success('Payment recorded successfully!');
      onSuccess?.(payment);
    } catch (error) {
      toast.error(error.message || 'Failed to record payment');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Record Payment</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Payment Amount *"
            type="number"
            step="0.01"
            leftIcon={<DollarSign className="h-5 w-5" />}
            {...register('amount', { required: 'Payment amount is required', min: 1 })}
            error={errors.amount?.message}
          />
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Mode *</label>
            <select
              {...register('paymentMode', { required: 'Payment mode is required' })}
              className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Select Mode</option>
              <option value="CASH">Cash</option>
              <option value="CHEQUE">Cheque</option>
              <option value="BANK_TRANSFER">Bank Transfer</option>
              <option value="UPI">UPI</option>
              <option value="CARD">Card</option>
            </select>
            {errors.paymentMode && <p className="text-sm text-red-600 mt-1">{errors.paymentMode.message}</p>}
          </div>

          <Input
            label="Agent/Collector *"
            leftIcon={<User className="h-5 w-5" />}
            {...register('agent', { required: 'Agent is required' })}
            error={errors.agent?.message}
          />

          <Input
            label="Transaction ID"
            leftIcon={<CreditCard className="h-5 w-5" />}
            {...register('transactionId')}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Remarks</label>
          <textarea
            {...register('remarks')}
            rows={3}
            className="block w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Additional notes about the payment..."
          />
        </div>

        <div className="flex gap-4 pt-6 border-t">
          <Button
            type="submit"
            loading={loading}
            className="flex-1"
          >
            Record Payment
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