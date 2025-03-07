import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';

type Appointment = {
  id: string;
  title: string;
  date: string;
  time: string;
  description: string;
};

export default function AppointmentDetails() {
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const router = useRouter();
  const { id } = router.query as { id: string };

  useEffect(() => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      router.push('/login');
      return;
    }
    
    if (!id) return; // Wait for the id to be available from router
    
    const fetchAppointment = async () => {
      try {
        const response = await fetch(`/api/appointments/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (!response.ok) {
          if (response.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            router.push('/login');
            return;
          }
          throw new Error('Failed to fetch appointment');
        }
        
        const data = await response.json();
        setAppointment(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAppointment();
  }, [id, router]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this appointment?')) {
      return;
    }
    
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    
    try {
      const response = await fetch(`/api/appointments/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete appointment');
      }
      
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (isLoading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!appointment) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">Appointment not found</h2>
          <Link href="/dashboard">
            <a className="mt-4 inline-block text-indigo-600 hover:text-indigo-500">
              Back to Dashboard
            </a>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between">
            <h1 className="text-3xl font-bold text-gray-900">Appointment Details</h1>
            <Link href="/dashboard">
              <a className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                Back to Dashboard
              </a>
            </Link>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="bg-white shadow rounded-lg p-6">
            {error && (
              <div className="mb-4 p-2 bg-red-100 text-red-700 rounded">
                {error}
              </div>
            )}
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900">Title</h3>
                <p className="mt-1 text-sm text-gray-600">{appointment.title}</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Date</h3>
                  <p className="mt-1 text-sm text-gray-600">{appointment.date}</p>
                </div>
                
                <div>
                  <h3 className="text-lg font-medium text-gray-900">Time</h3>
                  <p className="mt-1 text-sm text-gray-600">{appointment.time}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium text-gray-900">Description</h3>
                <p className="mt-1 text-sm text-gray-600">{appointment.description || 'No description provided.'}</p>
              </div>
              
              <div className="flex space-x-4 pt-4">
                <Link href={`/appointments/edit/${id}`}>
                  <a className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Edit
                  </a>
                </Link>
                <button
                  onClick={handleDelete}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}