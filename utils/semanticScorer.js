const axios = require('axios');

async function getSemanticScores(jobText, resumeTexts) {
  try {
    const res = await axios.post('http://127.0.0.1:5001/compare', {
      job: jobText,
      resumes: resumeTexts
    });

    return res.data.scores;
  } catch (error) {
    console.error("Error getting semantic scores:", error);
    return resumeTexts.map(() => 0); // default to 0 on failure
  }
}

module.exports = { getSemanticScores };
