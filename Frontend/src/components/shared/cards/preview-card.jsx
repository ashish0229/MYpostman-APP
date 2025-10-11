const PreviewCard = ({ post }) => (
  <div className="w-full max-w-md bg-white shadow-lg rounded-lg overflow-hidden border self-start">
    <div className="p-2 bg-gray-100 text-xs font-bold text-center uppercase">
      Status:
      <span
        className={`font-extrabold ${
          post.status === "approved"
            ? "text-green-600"
            : post.status === "published"
            ? "text-blue-600"
            : "text-yellow-600"
        }`}
      >
        {post.status}
      </span>
    </div>
    {post.image_url && (
      <img
        src={post.image_url}
        alt="Generated post"
        className="w-full h-48 object-cover"
        onError={(e) => {
          e.target.onerror = null;
          e.target.src =
            "https://placehold.co/600x400/FEE140/000000?text=Image+Error";
        }}
      />
    )}
    <div className="p-4">
      <p className="text-gray-700 whitespace-pre-wrap text-sm">
        {post.content}
      </p>
      <div className="mt-4 text-xs text-gray-500 font-semibold uppercase">
        {post.platform} Preview
      </div>
    </div>
  </div>
);

export default PreviewCard;
