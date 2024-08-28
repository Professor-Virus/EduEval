import { NextResponse } from 'next/server';
import puppeteer from 'puppeteer';
import * as cheerio from 'cheerio';
import { firestore } from '../../../firebase'; // Adjust path as needed
import axios from 'axios';
import { doc, setDoc } from 'firebase/firestore';

const openRouterApiKey = process.env.OPENROUTER_API_KEY;

async function analyzeSentiment(text) {
  try {
    const response = await axios.post(
      'https://openrouter.ai/api/v1/chat/completions',
      {
        model: 'nousresearch/hermes-3-llama-3.1-405b',
        messages: [
          { role: 'user', content: `Analyze the sentiment of this review: "${text}". Respond with a number between -1 (very negative) and 1 (very positive).` }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${openRouterApiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );

    if (response.data.choices && response.data.choices.length > 0) {
      return parseFloat(response.data.choices[0].message.content);
    } else {
      throw new Error('Invalid response format from OpenRouter API');
    }
  } catch (error) {
    console.error('Error calling OpenRouter API:', {
      message: error.message,
      response: error.response?.data,
      status: error.response?.status
    });
    throw error;
  }
}

export async function POST(req) {
  let browser;
  try {
    const { link } = await req.json();
    console.log('Fetching Rate My Professors page:', link);

    browser = await puppeteer.launch({
      headless: "new",
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-infobars',
        '--window-position=0,0',
        '--ignore-certifcate-errors',
        '--ignore-certifcate-errors-spki-list',
      ],
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.114 Safari/537.36');

    let content = '';
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        await page.goto(link, { 
          waitUntil: 'networkidle2',
          timeout: 90000
        });
        
        await page.waitForSelector('.Rating__RatingBody-sc-1rhvpxz-0', { timeout: 10000 });
        
        content = await page.content();
        break;
      } catch (error) {
        console.error(`Attempt ${attempt + 1} failed:`, error);
        if (attempt === 2) throw error;
      }
    }

    const $ = cheerio.load(content);

    console.log('Page title:', $('title').text());

    const reviewElements = $('.Rating__RatingBody-sc-1rhvpxz-0');
    console.log(`Found ${reviewElements.length} review elements`);

    const extractedReviews = reviewElements
    .map((_, el) => {
      const $el = $(el);
      const text = $el.find('.Comments__StyledComments-dzzyvm-0').text().trim();
  
      let ratingText = $el.find('.RatingValues__RatingValue-sc-6dc747-3').text().trim();
      if (!ratingText) {
        ratingText = $el.find('.RatingValue__Numerator-qw8sqy-2').text().trim();
      }
      if (!ratingText) {
        const ratingElement = $el.find('.RatingHeader__StyledHeader-sc-1dlkqw1-1 .RatingHeader__StyledClass-sc-1dlkqw1-3').text().trim();
        ratingText = ratingElement || '0';
      }
      const rating = parseFloat(ratingText) || 0;
  
      console.log('Review:', { text: text.substring(0, 50) + '...', rating });
  
      return { text, rating };
    })
    .get()
    .filter(review => review.text)
    .slice(0, 15);

    console.log(`Extracted ${extractedReviews.length} valid reviews`);

    if (extractedReviews.length === 0) {
      throw new Error('No reviews found. The scraping selector might need to be updated.');
    }

    const sentiments = await Promise.all(extractedReviews.map(review => analyzeSentiment(review.text)));

    const averageSentiment = sentiments.reduce((a, b) => a + b, 0) / sentiments.length;
    const averageRating = extractedReviews.reduce((sum, review) => sum + review.rating, 0) / extractedReviews.length;

    // Store the data in Firestore
    const reviewDocRef = doc(firestore, 'reviews', link);
    await setDoc(reviewDocRef, {
      averageSentiment,
      averageRating,
      reviewCount: extractedReviews.length,
      reviews: extractedReviews.map((review, index) => ({
        text: review.text,
        rating: review.rating,
        sentiment: sentiments[index]
      }))
    });

    return NextResponse.json({ 
      averageSentiment, 
      averageRating,
      reviewCount: extractedReviews.length,
      reviews: extractedReviews.map((review, index) => ({
        text: review.text,
        rating: review.rating,
        sentiment: sentiments[index]
      }))
    });
  } catch (error) {
    console.error('Error analyzing professor reviews:', error);
    return NextResponse.json({ error: 'Failed to analyze professor reviews: ' + error.message }, { status: 500 });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
