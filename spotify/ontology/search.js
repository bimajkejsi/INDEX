const synaptic = require("synaptic");
const { Layer, Network } = synaptic;

// Calculate weight for each criterion based on weight factors
const calculateWeight = (criteria, weightFactor) => {
  return criteria.map((criterion) => {
    const { name, value, weight } = criterion;
    return {
      name,
      score: value * (weightFactor[name] || 1),
    };
  });
};

// Normalize scores to a scale of 0-100
const normalizeScores = (scores) => {
  const maxScore = Math.max(...scores.map((s) => s.score));
  return scores.map((s) => ({
    ...s,
    normalizedScore: maxScore > 0 ? (s.score / maxScore) * 100 : 0,
  }));
};

// Create a more advanced Synaptic network
const createSynapticNetwork = () => {
  const inputLayer = new Layer(12); // Extended inputs for 12 emotions
  const hiddenLayer1 = new Layer(24);
  const hiddenLayer2 = new Layer(12);
  const outputLayer = new Layer(1); // Single output: relevance score

  inputLayer.project(hiddenLayer1);
  hiddenLayer1.project(hiddenLayer2);
  hiddenLayer2.project(outputLayer);

  return new Network({
    input: inputLayer,
    hidden: [hiddenLayer1, hiddenLayer2],
    output: outputLayer,
  });
};

// Train the Synaptic network with configurable parameters
const trainNetwork = (
  network,
  trainingData,
  learningRate = 0.05,
  iterations = 5000
) => {
  trainingData.forEach(({ input, output }) => {
    for (let i = 0; i < iterations; i++) {
      network.activate(input);
      network.propagate(learningRate, output);
    }
  });
};

// Predict relevance score using the trained network
const predictWithNetwork = (network, input) => {
  return network.activate(input);
};

// Multi-criteria matching with extended features
const multiCriteriaMatching = (filters, song, network) => {
  const songName = typeof song.name === "string" ? song.name.toLowerCase() : "";
  const artistName =
    typeof song.artist === "string" ? song.artist.toLowerCase() : "";
  const filterArtist = filters.artist ? filters.artist.toLowerCase() : "";

  const input = [
    song.emotional_analysis?.happy || 0,
    song.emotional_analysis?.sad || 0,
    song.emotional_analysis?.angry || 0,
    song.emotional_analysis?.relaxed || 0,
    song.emotional_analysis?.excited || 0,
    song.emotional_analysis?.bored || 0,
    song.emotional_analysis?.calm || 0,
    song.emotional_analysis?.fear || 0,
    song.emotional_analysis?.surprise || 0,
    song.emotional_analysis?.love || 0,
    song.emotional_analysis?.nostalgic || 0,
    song.emotional_analysis?.joy || 0,
  ];

  const predictedScore = predictWithNetwork(network, input);

  const keywordMatch = filters.keyword
    ? songName.includes(filters.keyword.toLowerCase()) ||
      artistName.includes(filters.keyword.toLowerCase())
      ? 100
      : 0
    : 0;

  const artistMatch = filterArtist
    ? artistName === filterArtist
      ? 300 // High score for exact artist match
      : 0
    : 0;

  return {
    ...song,
    totalScore: predictedScore[0] + keywordMatch + artistMatch,
    detailedScores: normalizeScores([
      { name: "predictedScore", score: predictedScore[0] },
      { name: "keywordMatch", score: keywordMatch },
      { name: "artistMatch", score: artistMatch },
    ]),
  };
};

// Prepare training data for the extended network
const prepareTrainingData = (songsData) => {
  return songsData.map((song) => ({
    input: [
      song.emotional_analysis?.happy || 0,
      song.emotional_analysis?.sad || 0,
      song.emotional_analysis?.angry || 0,
      song.emotional_analysis?.relaxed || 0,
      song.emotional_analysis?.excited || 0,
      song.emotional_analysis?.bored || 0,
      song.emotional_analysis?.calm || 0,
      song.emotional_analysis?.fear || 0,
      song.emotional_analysis?.surprise || 0,
      song.emotional_analysis?.love || 0,
      song.emotional_analysis?.nostalgic || 0,
      song.emotional_analysis?.joy || 0,
    ],
    output: [song.score ? song.score / 100 : 0],
  }));
};

// Advanced analysis for matching songs
const analyzeSongFeatures = (song) => {
  return {
    energyLevel:
      song.audio_features?.energy > 0.7 ? "High Energy" : "Low Energy",
    acousticQuality:
      song.audio_features?.acousticness > 0.5 ? "Acoustic" : "Electronic",
    tempoCategory:
      song.audio_features?.tempo >= 120
        ? "Fast"
        : song.audio_features?.tempo >= 60
          ? "Moderate"
          : "Slow",
  };
};

module.exports = {
  createSynapticNetwork,
  trainNetwork,
  predictWithNetwork,
  multiCriteriaMatching,
  prepareTrainingData,
  analyzeSongFeatures,
  calculateWeight,
  normalizeScores,
};
