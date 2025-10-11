const UsersView = ({ userRole, users }) => {
  if (userRole !== "admin") {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        Access Denied. This page is for administrators only.
      </div>
    );
  }
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">User Management</h2>
      <div className="bg-white p-6 rounded-xl shadow border">
        <table className="min-w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-2">Name</th>
              <th className="text-left p-2">Role</th>
              <th className="text-left p-2">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b hover:bg-gray-50">
                <td className="p-2">{u.display_name}</td>
                <td className="p-2 capitalize">{u.role}</td>
                <td className="p-2">
                  {new Date(u.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersView;
