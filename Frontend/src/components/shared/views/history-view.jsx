const HistoryView = ({ posts }) => {
  if (!posts || !posts.length) {
    return (
      <div>
        <h2 className="text-2xl font-bold mb-6">Post History</h2>
        <p className="text-gray-500">No posts have been generated yet.</p>
      </div>
    );
  }
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Post History</h2>
      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="bg-white p-4 rounded-lg shadow border">
            <p className="font-bold">{post.topic}</p>
            <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">
              {post.content}
            </p>
            <div className="text-xs text-gray-500 mt-2">
              Status:
              <span className="font-semibold capitalize">{post.status}</span> |
              Created: {new Date(post.created_at).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HistoryView;
