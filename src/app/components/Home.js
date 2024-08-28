import { useState } from 'react';
import Navbar from './Navbar';

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
      console.error('Error analyzing restaurant:', error);
      setResult({ error: 'Failed to analyze restaurant reviews' });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex flex-col">
      <Navbar />
      <div className="flex flex-col items-center justify-center p-4 flex-grow">
        <h1 className="text-4xl font-bold mb-8">Professor Sentiment</h1>
        <form onSubmit={handleSubmit} className="w-full max-w-md mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <input
              type="text"
              placeholder="Enter RMP link"
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
                <p>Average Rating: {result.averageRating.toFixed(1)} / 5</p>
                <p>Number of Reviews: {result.reviewCount}</p>
                <div className="mt-4">
                  <h3 className="text-xl font-semibold mb-2">Reviews:</h3>
                  {result.reviews.map((review, index) => (
                    <div key={index} className="mb-2 p-2 border border-gray-700 rounded">
                      <p>{review.text}</p>
                      <p className="text-sm text-gray-400">
                        Rating: {review.rating} / 5 | Sentiment: {review.sentiment.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;
