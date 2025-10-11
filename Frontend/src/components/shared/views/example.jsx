const GeneratorView = ({
  topic,
  setTopic,
  tone,
  setTone,
  platform,
  setPlatform,
  handleGenerate,
  isLoading,
  error,
  generatedPost,
  handlePostNow,
}) => {
  const canPostNow = generatedPost && generatedPost.status === "approved";
  const isPublished = generatedPost && generatedPost.status === "published";
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 h-full">
      {" "}
      <div className="bg-white p-8 rounded-2xl shadow-lg flex flex-col border">
        {" "}
        <h2 className="text-2xl font-bold mb-2">Create a new post</h2>{" "}
        <p className="text-gray-500 mb-6">
          Describe your post, and let AI do the rest.
        </p>{" "}
        <div className="flex flex-col space-y-6 flex-grow">
          {" "}
          <div>
            {" "}
            <label
              htmlFor="topic"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Topic / Prompt
            </label>{" "}
            <textarea
              id="topic"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="w-full h-32 p-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-yellow-500"
            />{" "}
          </div>{" "}
          <div className="grid grid-cols-2 gap-6">
            {" "}
            <div>
              {" "}
              <label
                htmlFor="tone"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Tone of Voice
              </label>{" "}
              <select
                id="tone"
                value={tone}
                onChange={(e) => setTone(e.target.value)}
                className="w-full p-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-yellow-500"
              >
                {" "}
                <option>Excited</option>
                <option>Professional</option>
                <option>Witty</option>
                <option>Friendly</option>
                <option>Urgent</option>{" "}
              </select>{" "}
            </div>{" "}
            <div>
              {" "}
              <label
                htmlFor="platform"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                Platform
              </label>{" "}
              <select
                id="platform"
                value={platform}
                onChange={(e) => setPlatform(e.target.value)}
                className="w-full p-3 bg-gray-50 border rounded-lg focus:ring-2 focus:ring-yellow-500"
              >
                {" "}
                <option>Instagram</option>
                <option>Twitter / X</option>
                <option>Facebook</option>
                <option>LinkedIn</option>{" "}
              </select>{" "}
            </div>{" "}
          </div>{" "}
        </div>{" "}
        <button
          onClick={handleGenerate}
          disabled={isLoading}
          className="w-full mt-6 bg-yellow-400 hover:bg-yellow-500 disabled:bg-gray-400 text-gray-900 font-bold py-4 px-4 rounded-lg flex items-center justify-center text-lg shadow-md"
        >
          {" "}
          {isLoading ? "Generating..." : "✨ Generate Post"}{" "}
        </button>{" "}
      </div>{" "}
      <div className="bg-white p-8 rounded-2xl shadow-lg flex flex-col border">
        {" "}
        <h2 className="text-2xl font-bold mb-6">Preview</h2>{" "}
        <div className="flex-grow flex items-center justify-center border-2 border-dashed rounded-xl bg-gray-50 p-4">
          {" "}
          {isLoading && !generatedPost && <LoadingCard />}{" "}
          {error && <ErrorCard error={error} />}{" "}
          {!isLoading && !error && generatedPost && (
            <PreviewCard post={generatedPost} />
          )}{" "}
          {!isLoading && !error && !generatedPost && (
            <div className="text-center text-gray-400">
              {" "}
              <ImageIcon className="mx-auto h-12 w-12" />
              <p className="mt-2">Your post will appear here.</p>{" "}
            </div>
          )}{" "}
        </div>{" "}
        {generatedPost && !error && (
          <div className="flex space-x-4 mt-6">
            {" "}
            <button className="flex-1 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-4 rounded-lg">
              Schedule
            </button>{" "}
            <button
              onClick={handlePostNow}
              disabled={!canPostNow || isLoading}
              className={`flex-1 font-bold py-3 px-4 rounded-lg ${
                canPostNow
                  ? "bg-green-500 hover:bg-green-600 text-white"
                  : isPublished
                  ? "bg-blue-500 text-white cursor-default"
                  : "bg-gray-400 text-gray-700 cursor-not-allowed"
              }`}
            >
              {" "}
              {isLoading && "Processing..."}{" "}
              {!isLoading && isPublished && "Published"}{" "}
              {!isLoading && !isPublished && "Post Now"}{" "}
            </button>{" "}
          </div>
        )}{" "}
      </div>{" "}
    </div>
  );
};
