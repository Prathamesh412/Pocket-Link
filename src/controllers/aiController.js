const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate tags for content using Gemini AI
 */
exports.generateTags = async (req, res) => {
  try {
    const { title, description, url, existingTags } = req.body;

    if (!title && !description) {
      return res.status(400).json({ error: 'Title or description is required' });
    }

    // Prepare the prompt
    const content = `${title || ''} ${description || ''}`.substring(0, 1000);
    const existingStr = existingTags?.length ? ` Existing tags: ${existingTags.join(', ')}.` : '';

    const prompt = `You are a helpful assistant that generates relevant, concise tags for web content.
    
Content to tag:
Title: ${title || 'N/A'}
Description: ${description || 'N/A'}
URL: ${url || 'N/A'}

${existingStr}

Generate 5-8 relevant, lowercase tags for this content. Tags should be:
- Single words or very short phrases (1-3 words max)
- Lowercase
- Relevant to the content
- Useful for categorization and filtering
- Not duplicates of existing tags if any

Return ONLY the tags as a comma-separated list, nothing else.
Example format: technology, tutorial, javascript, web-development, learning`;

    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Parse the tags
    const tags = text
      .split(',')
      .map(tag => tag.trim().toLowerCase())
      .filter(tag => tag.length > 0 && tag.length < 30)
      .slice(0, 8);

    res.json({
      success: true,
      tags,
      tagString: tags.join(', '), // Return comma-separated with space
      suggestion: 'Click tags to add them to your link',
    });
  } catch (error) {
    console.error('Tag generation error:', error);
    
    // Fallback: return empty tags if API fails
    if (error.message.includes('API key')) {
      return res.status(500).json({
        error: 'Gemini API not configured',
        tags: [],
      });
    }

    res.status(500).json({
      error: 'Failed to generate tags',
      tags: [],
    });
  }
};

/**
 * Generate a detailed description for a link using Gemini AI
 */
exports.generateDescription = async (req, res) => {
  try {
    const { title, description, url, tags } = req.body;

    if (!title && !description) {
      return res.status(400).json({ error: 'Title or description is required' });
    }

    const tagsStr = tags?.length ? `\nTags: ${tags.join(', ')}` : '';
    
    const prompt = `You are a helpful assistant that creates short, engaging product-like descriptions for web content.
    
Based on the following information, create a SHORT 2-3 sentence description that explains what this page is about in a concise, engaging way:

Title: ${title || 'N/A'}
Original Description: ${description || 'N/A'}
URL: ${url || 'N/A'}${tagsStr}

Write ONLY the engaging description (2-3 sentences), nothing else. Make it sound like a product description.`;

    const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim();

    res.json({
      success: true,
      description: text,
    });
  } catch (error) {
    console.error('Description generation error:', error);
    
    if (error.message.includes('API key')) {
      return res.status(500).json({
        error: 'Gemini API not configured',
        description: '',
      });
    }

    res.status(500).json({
      error: 'Failed to generate description',
      description: '',
    });
  }
};
