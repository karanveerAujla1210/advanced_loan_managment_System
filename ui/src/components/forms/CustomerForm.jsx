import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import Button from '../ui/Button';
import Input from '../ui/Input';
import { User, Phone, Mail, MapPin } from 'lucide-react';

export default function CustomerForm({ onSuccess, onCancel }) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await fetch('/api/borrowers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          personalInfo: {
            firstName: data.firstName,
            lastName: data.lastName,
            fatherName: data.fatherName,
            dateOfBirth: data.dateOfBirth,
            gender: data.gender,
            maritalStatus: data.maritalStatus
          },
          contact: {
            phone: data.phone,
            alternatePhone: data.alternatePhone,
            email: data.email,
            address: {
              street: data.street,
              city: data.city,
              state: data.state,
              pincode: data.pincode
            }
          },
          kyc: {
            aadharNumber: data.aadharNumber,
            panNumber: data.panNumber
          },
          financial: {
            monthlyIncome: parseFloat(data.monthlyIncome),
            occupation: data.occupation,
            employer: data.employer
          }
        })
      });

      if (!response.ok) {
        throw new Error('Failed to create customer');
      }

      const customer = await response.json();
      toast.success('Customer created successfully!');
      onSuccess?.(customer);
    } catch (error) {
      toast.error(error.message || 'Failed to create customer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-xl font-semibold mb-6">Create New Customer</h2>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="First Name *"
            leftIcon={<User className="h-5 w-5" />}
            {...register('firstName', { required: 'First name is required' })}
            error={errors.firstName?.message}
          />
          <Input
            label="Last Name *"
            leftIcon={<User className="h-5 w-5" />}
            {...register('lastName', { required: 'Last name is required' })}
            error={errors.lastName?.message}
          />
          <Input
            label="Phone Number *"
            leftIcon={<Phone className="h-5 w-5" />}
            {...register('phone', { required: 'Phone number is required' })}
            error={errors.phone?.message}
          />
          <Input
            label="Email"
            type="email"
            leftIcon={<Mail className="h-5 w-5" />}
            {...register('email')}
          />
        </div>

        <div className="flex gap-4 pt-6 border-t">
          <Button
            type="submit"
            loading={loading}
            className="flex-1"
          >
            Create Customer
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