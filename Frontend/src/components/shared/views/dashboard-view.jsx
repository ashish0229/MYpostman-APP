const DashboardView = ({ stats }) => (
  <div>
    <h2 className="text-2xl font-bold mb-6">Real-Time Dashboard</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="bg-white p-6 rounded-xl shadow border">
        <h3 className="text-gray-500">Posts Today</h3>
        <p className="text-4xl font-bold mt-2">{stats.postsToday}</p>
      </div>
      <div className="bg-white p-6 rounded-xl shadow border">
        <h3 className="text-gray-500">New Users (24h)</h3>
        <p className="text-4xl font-bold mt-2">{stats.newUsers}</p>
      </div>
      <div className="bg-red-50 p-6 rounded-xl shadow border border-red-200">
        <h3 className="text-red-600">Violations (24h)</h3>
        <p className="text-4xl font-bold mt-2 text-red-700">
          {stats.policyViolations}
        </p>
      </div>
    </div>
    <div className="mt-8 bg-white p-6 rounded-xl shadow border">
      <h3 className="text-lg font-bold mb-4">Community Activity Stream</h3>
      <p className="text-gray-500">
        This stream will update in real-time as new events occur...
      </p>
    </div>
  </div>
);

export default DashboardView;
