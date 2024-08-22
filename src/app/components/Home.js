import { useState } from 'react';
import Navbar from './Navbar'; // Adjust the path as needed

function HomePage() {
  const [link, setLink] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ link }),
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error analyzing professor:', error);
      setResult({ error: 'Failed to analyze professor' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col">
      <Navbar /> {/* Include the Navbar component */}
      <div className="flex flex-col items-center justify-center p-4 flex-grow">
        <h1 className="text-4xl font-bold mb-8">EduEval</h1>
        <form onSubmit={handleSubmit} className="w-full max-w-md mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Enter Rate My Professor link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="flex-grow px-4 py-2 rounded-md bg-gray-800 border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition duration-200 ease-in-out"
              disabled={loading}
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
        </form>
        {result && (
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold mb-4">Analysis Result</h2>
            {result.error ? (
              <p className="text-red-500">{result.error}</p>
            ) : (
              <>
                <p>Average Sentiment: {result.averageSentiment.toFixed(2)}</p>
                <p>Number of Reviews: {result.reviewCount}</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;