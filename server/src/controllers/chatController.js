const Event = require('../models/Event');

exports.chat = async (req, res) => {
  try {
    const { message, history } = req.body;
    if (!message) return res.status(400).json({ message: 'Message is required' });

    // Fetch all approved events
    const events = await Event.find({ status: 'approved' }).populate('organizer', 'name email');

    // Build the grounding context
    const eventsContext = events.map(ev => ({
      id: ev._id,
      title: ev.title,
      description: ev.description,
      category: ev.category,
      date: ev.date.toLocaleString(),
      location: ev.location,
      organizer: ev.organizer?.name || 'Campus Connect Club',
      mode: ev.mode,
      capacity: ev.capacity
    }));

    const systemPrompt = `You are "Campus Connect AI Helper", a premium AI assistant for our college campus discovery webapp.
Your main job is to answer questions about campus events.
You are strictly grounded: you can ONLY discuss the events provided in the dataset below.
If the user asks about an event not in the dataset, reply politely that we don't have that scheduled yet, and suggest some similar upcoming events that ARE in the dataset.
DO NOT hallucinate or make up any event details. Keep responses brief, stylish, and highly helpful, using emojis and clean markdown formatting.

Here is the database of current active events on campus:
${JSON.stringify(eventsContext, null, 2)}

Answer the user's question clearly. Always ground your facts in the database events. If they ask generic questions, align them back to discovering campus events.`;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'replace_me') {
      return res.json({ 
        reply: "👋 Hi there! I'm Campus Connect AI. Currently, my developer hasn't configured the `GEMINI_API_KEY` in the server environment, so I cannot answer live questions yet. Organizers, please set your API key in the `.env` file to unlock me!" 
      });
    }

    // Build contents array including history if provided
    const contents = [];
    if (history && Array.isArray(history)) {
      // Map history to Gemini format, filtering out the initial AI welcome message
      history.filter(h => h.text && !h.text.startsWith("👋 Hi there!")).forEach(h => {
        contents.push({
          role: h.sender === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }]
        });
      });
    }

    // Append current user message
    contents.push({
      role: 'user',
      parts: [{ text: `${systemPrompt}\n\nUser Question: ${message}` }]
    });

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents,
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 800
        }
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Gemini API Error:', errText);
      return res.status(502).json({ message: 'Error communicating with AI assistant service.' });
    }

    const data = await response.json();
    const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || "I couldn't process that request. Let's try again.";
    
    res.json({ reply: replyText });
  } catch (err) {
    console.error('Chat error:', err);
    res.status(500).json({ message: err.message });
  }
};
