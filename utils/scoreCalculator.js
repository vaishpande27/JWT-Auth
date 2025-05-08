function calculateATSScore(applicant, job, rawSemanticScore) {
    const resumeText = applicant.resumeText?.toLowerCase() || '';
    // console.log(resumeText)
    const jobSkills = job.skills.map(skill => skill.toLowerCase());
  
    // ✅ Keyword Score
    const matchedSkills = jobSkills.filter(skill => resumeText.includes(skill));
    const keywordScore = Math.min((matchedSkills.length / jobSkills.length) * 100, 100);
  
    console.log(`🔍 Applicant: ${applicant.name}`);
    console.log(`🔸 Matched Skills: ${matchedSkills.join(', ')}`);
    console.log(`🔸 Keyword Score: ${keywordScore.toFixed(2)} / 100`);
  
    // ✅ Experience Score
    const expYears = parseFloat(applicant.experience) || 0;
    const expScore = Math.min(expYears * 5, 100);
    console.log(`🔸 Experience Years: ${expYears}`);
    console.log(`🔸 Experience Score: ${expScore.toFixed(2)} / 100`);
  
    // ✅ Semantic Score
    console.log(`🔸 Semantic Similarity Raw: ${rawSemanticScore.toFixed(4)}`);
  
    // ✅ Final Score
    const finalScoreRaw = (rawSemanticScore * 0.55) + (keywordScore * 0.45) + (expScore * 0.05);
    console.log('finalScoreRaw:',finalScoreRaw)
    const finalScore = Math.round(Math.min(finalScoreRaw, 100));
  
    console.log(`✅ Final ATS Score: ${finalScore}`);
    console.log('--------------------------------------------');
  
    return {
      finalScore,
      semanticScore: parseFloat(rawSemanticScore.toFixed(2)),
      keywordScore: parseFloat(keywordScore.toFixed(2)),
      expScore: parseFloat(expScore.toFixed(2))
    };
  }
  
  module.exports = calculateATSScore;
  