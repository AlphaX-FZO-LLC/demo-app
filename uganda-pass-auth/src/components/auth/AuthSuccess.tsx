import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function AuthSuccess() {
  return (
    <div className="bg-white rounded-2xl p-6 text-center min-w-md">
      <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <span className="text-2xl">✅</span>
      </div>
      <h2 className="text-xl font-bold text-black mb-2">Authentication Successful!</h2>
      <LoadingSpinner className="h-6 w-6 mx-auto mt-4" />
    </div>
  );
}