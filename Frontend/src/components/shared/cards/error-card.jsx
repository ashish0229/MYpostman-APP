const ErrorCard = ({ error }) => (
  <div className="p-6 bg-red-50 border rounded-lg text-center max-w-sm mx-auto">
    <h3 className="text-xl font-bold text-red-700">Action Failed!</h3>
    <p className="text-red-600 mt-2 text-sm">{error.message}</p>
    <p className="text-xs text-red-500 mt-1">{error.status}</p>
  </div>
);

export default ErrorCard;
