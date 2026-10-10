import * as tf from "@tensorflow/tfjs";
import fs from "fs";
import path from "path";
import { normalizeFeatures } from "./preprocessing";
let modelWeights = [0.1, 0.65, -0.15, 0.15, 0.05, 0.08, 0.1];
let modelBias = 0.05;
let rootMeanSquaredError = 35.5;
let isModelTrained = false;
function loadPriceHistory() {
  try {
    const filePath = path.join(process.cwd(), "data", "price-history.json");
    if (!fs.existsSync(filePath)) {
      console.warn(`Price history file not found at: ${filePath}`);
      return [];
    }
    const rawData = fs.readFileSync(filePath, "utf-8");
    return JSON.parse(rawData);
  } catch (error) {
    console.error("Error reading price history:", error);
    return [];
  }
}
async function trainTensorFlowModel() {
  const dataset = loadPriceHistory();
  if (dataset.length === 0) {
    return {
      weights: [...modelWeights, modelBias],
      mse: rootMeanSquaredError,
      epochs: 0,
      learningRate: 0.01,
      samplesCount: 0
    };
  }
  const epochs = 100;
  const learningRate = 0.05;
  try {
    const inputData = [];
    const outputData = [];
    dataset.forEach((sample) => {
      const condScore = sample.condition === "VERY_GOOD" ? 4 : sample.condition === "LIKE_NEW" ? 4.5 : sample.condition === "GOOD" ? 3 : 2;
      const norm = normalizeFeatures(
        sample.originalPrice,
        sample.age,
        condScore,
        sample.edition,
        sample.category,
        sample.demandScore
      );
      inputData.push([
        norm.xPrice,
        norm.xAge,
        norm.xCondition,
        norm.xEdition,
        norm.xCategory,
        norm.xDemand
      ]);
      const ratio = sample.finalSellingPrice / sample.originalPrice;
      outputData.push([ratio]);
    });
    const xs = tf.tensor2d(inputData);
    const ys = tf.tensor2d(outputData);
    const model = tf.sequential();
    model.add(tf.layers.dense({
      units: 1,
      inputShape: [6],
      useBias: true
    }));
    model.compile({
      optimizer: tf.train.sgd(learningRate),
      loss: "meanSquaredError"
    });
    await model.fit(xs, ys, {
      epochs,
      verbose: 0
    });
    const weightsTensor = model.layers[0].getWeights()[0];
    const biasTensor = model.layers[0].getWeights()[1];
    const weightsArr = Array.from(await weightsTensor.data());
    const biasArr = Array.from(await biasTensor.data());
    modelWeights = weightsArr;
    modelBias = biasArr[0];
    isModelTrained = true;
    const predictions = model.predict(xs);
    const errors = tf.sub(predictions, ys);
    const squaredErrors = tf.square(errors);
    const meanSquaredError = tf.mean(squaredErrors);
    const mseVal = Array.from(await meanSquaredError.data())[0];
    rootMeanSquaredError = parseFloat((Math.sqrt(mseVal) * 500).toFixed(2));
    xs.dispose();
    ys.dispose();
    predictions.dispose();
    errors.dispose();
    squaredErrors.dispose();
    meanSquaredError.dispose();
    return {
      weights: modelWeights,
      mse: rootMeanSquaredError,
      epochs,
      learningRate,
      samplesCount: dataset.length
    };
  } catch (err) {
    console.error("Error during TF model training, returning defaults:", err);
    return {
      weights: modelWeights,
      mse: rootMeanSquaredError,
      epochs: 0,
      learningRate,
      samplesCount: dataset.length
    };
  }
}
function getResaleRatio(xPrice, xAge, xCondition, xEdition, xCategory, xDemand) {
  if (!isModelTrained) {
    trainTensorFlowModel().catch(() => {
    });
  }
  const rawRatio = modelBias + modelWeights[0] * xPrice + modelWeights[1] * xAge + modelWeights[2] * xCondition + modelWeights[3] * xEdition + modelWeights[4] * xCategory + modelWeights[5] * xDemand;
  return Math.max(0.15, Math.min(0.9, rawRatio));
}
function getTrainedMetadata() {
  return {
    weights: [...modelWeights],
    mse: rootMeanSquaredError,
    epochs: isModelTrained ? 100 : 0,
    learningRate: 0.05,
    samplesCount: loadPriceHistory().length
  };
}
export {
  getResaleRatio,
  getTrainedMetadata,
  loadPriceHistory,
  trainTensorFlowModel
};
