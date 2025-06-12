// backend/prompt-logic.js
function getChordProgressionsPrompt(musicalKey, musicType) {
  if (!musicalKey || !musicType) {
    throw new Error('Musical key and music type are required.');
  }
  // More sophisticated prompt engineering can be done here.
  return `List common chord progressions in ${musicalKey} for ${musicType} music.
For each progression, also list a few well-known songs that use it.
Return the output in a structured format, like JSON if possible, or clearly delineated sections.
Example for a progression:
Progression: I-IV-V
Songs: La Bamba, Twist and Shout

Progression: ii-V-I
Songs: Autumn Leaves, Tune Up
`;
}

module.exports = { getChordProgressionsPrompt };
