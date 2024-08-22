import { NextResponse } from 'next/server';
import axios from 'axios';
import cheerio from 'cheerio';
import { Pinecone } from '@pinecone-database/pinecone';

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const groqApiKey = process.env.GROQ_API_KEY;

async function analyzeSentiment(text) {
  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: 'llama-70b-chatbot',
        messages: [
          { role: 'user', content: `Analyze the sentiment of this review: "${text}". Respond with a number between -1 (very negative) and 1 (very positive).` }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    return parseFloat(response.data.choices[0].message.content);
  } catch (error) {
    console.error('Error calling Groq API:', error);
    throw error;
  }
}

export async function POST(req) {
  const { link } = await req.json();

  try {
    // Scrape the Rate My Professor page
    const { data } = await axios.get(link);
    const $ = cheerio.load(data);

    // Extract reviews (this selector might need to be adjusted based on the actual page structure)
    const reviews = $('.review-text').map((_, el) => $(el).text()).get();

    // Use Groq API for sentiment analysis
    const sentiments = await Promise.all(reviews.map(analyzeSentiment));

    // Calculate average sentiment
    const averageSentiment = sentiments.reduce((a, b) => a + b, 0) / sentiments.length;

    // Store the results in Pinecone
    const index = pinecone.index('professor-reviews');
    await index.upsert([{
      id: link,
      values: [averageSentiment],
      metadata: { reviewCount: reviews.length },
    }]);

    return NextResponse.json({ averageSentiment, reviewCount: reviews.length });
  } catch (error) {
    console.error('Error analyzing professor:', error);
    return NextResponse.json({ error: 'Failed to analyze professor' }, { status: 500 });
  }
}