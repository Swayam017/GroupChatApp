const generateContent = require("../utils/gemini");

// PREDICT NEXT 

exports.predictNext = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length < 2) {
      return res.json({ suggestions: [] });
    }

    const tone = req.user?.tone || "casual";

    const prompt = `
You are a predictive typing engine for a chat app.

User tone: ${tone}

User typed:
"${text}"

Suggest 3 short next phrase completions.
Keep each under 5 words.
Return only comma separated suggestions.
No explanation.
`;

    const aiResponse = await generateContent(prompt);

    if (!aiResponse) {
      return res.json({ suggestions: [] });
    }

    const suggestions = aiResponse
      .replace(/\n/g, ",")      // handle newline responses
      .split(",")
      .map(s => s.trim())
      .filter(Boolean)
      .slice(0, 3);

    res.json({ suggestions });

  } catch (err) {
    console.error("Predict Error:", err);
    res.status(500).json({ error: "AI error" });
  }
};


// SMART REPLIES 

exports.smartReplies = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message || message.trim().length < 2) {
      return res.json({ replies: [] });
    }

    const prompt = `
You are a smart reply generator for a messaging app.

Incoming message:
"${message}"

Generate 3 short reply options.
Keep each under 12 words.
Return only comma separated replies.
No explanation.
`;

    const aiResponse = await generateContent(prompt);

    if (!aiResponse) {
      return res.json({ replies: [] });
    }

    const replies = aiResponse
      .replace(/\n/g, ",")
      .split(",")
      .map(r => r.trim())
      .filter(Boolean)
      .slice(0, 3);

    res.json({ replies });

  } catch (err) {
    console.error("Smart Reply Error:", err);
    res.status(500).json({ error: "AI error" });
  }
};
