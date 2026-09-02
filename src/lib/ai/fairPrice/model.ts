import * as tf from '@tensorflow/tfjs';
import fs from 'fs';
import path from 'path';
import { normalizeFeatures } from './preprocessing';

export interface BookPriceSample {
  title: string;
  category: string;
  originalPrice: number;
  purchaseDate: string;
  condition: string;
  edition: number;
  age: number;
  historicalSellingPrice: number;
  demandScore: number;
  finalSellingPrice: number;
}

export interface ModelMetadata {
  weights: number[]; // [bias, wPrice, wAge, wCondition, wEdition, wCategory, wDemand]
  mse: number;
  epochs: number;
  learningRate: number;
  samplesCount: number;
}

// Global trained weights cache
let modelWeights: number[] = [0.1, 0.65, -0.15, 0.15, 0.05, 0.08, 0.1];
let modelBias = 0.05;
let rootMeanSquaredError = 35.5;
let isModelTrained = false;

/**
 * Loads the dataset from data/price-history.json
 */
export function loadPriceHistory(): BookPriceSample[] {
  try {
    const filePath = path.join(process.cwd(), 'data', 'price-history.json');
    if (!fs.existsSync(filePath)) {
      console.warn(`Price history file not found at: ${filePath}`);
      return [];
    }
    const rawData = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(rawData) as BookPriceSample[];
  } catch (error) {
    console.error('Error reading price history:', error);
    return [];
  }
}

/**
 * Trains the TensorFlow.js linear regression model locally on the price history dataset.
 */
export async function trainTensorFlowModel(): Promise<ModelMetadata> {
  const dataset = loadPriceHistory();
  if (dataset.length === 0) {
    return {
      weights: [...modelWeights, modelBias],
      mse: rootMeanSquaredError,
      epochs: 0,
      learningRate: 0.01,
      samplesCount: 0,
    };
  }

  const epochs = 100;
  const learningRate = 0.05;

  try {
    // 1. Prepare training tensors
    const inputData: number[][] = [];
    const outputData: number[][] = [];

    dataset.forEach((sample) => {
      // Condition score mapping locally
      const condScore = sample.condition === 'VERY_GOOD' ? 4 : 
                         sample.condition === 'LIKE_NEW' ? 4.5 : 
                         sample.condition === 'GOOD' ? 3 : 2;

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

      // Predict the fractional ratio of resale price to original cover price
      const ratio = sample.finalSellingPrice / sample.originalPrice;
      outputData.push([ratio]);
    });

    const xs = tf.tensor2d(inputData);
    const ys = tf.tensor2d(outputData);

    // 2. Build regression network
    const model = tf.sequential();
    model.add(tf.layers.dense({
      units: 1,
      inputShape: [6],
      useBias: true
    }));

    model.compile({
      optimizer: tf.train.sgd(learningRate),
      loss: 'meanSquaredError'
    });

    // 3. Fit
    await model.fit(xs, ys, {
      epochs: epochs,
      verbose: 0
    });

    // 4. Extract weights
    const weightsTensor = model.layers[0].getWeights()[0];
    const biasTensor = model.layers[0].getWeights()[1];

    const weightsArr = Array.from(await weightsTensor.data());
    const biasArr = Array.from(await biasTensor.data());

    modelWeights = weightsArr;
    modelBias = biasArr[0];
    isModelTrained = true;

    // Calculate dynamic RMSE (Root Mean Squared Error)
    const predictions = model.predict(xs) as tf.Tensor;
    const errors = tf.sub(predictions, ys);
    const squaredErrors = tf.square(errors);
    const meanSquaredError = tf.mean(squaredErrors);
    const mseVal = Array.from(await meanSquaredError.data())[0];
    
    // Scale error back to approximate currency units (INR)
    rootMeanSquaredError = parseFloat((Math.sqrt(mseVal) * 500).toFixed(2));

    // Cleanup tensors
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
    console.error('Error during TF model training, returning defaults:', err);
    return {
      weights: modelWeights,
      mse: rootMeanSquaredError,
      epochs: 0,
      learningRate,
      samplesCount: dataset.length
    };
  }
}

/**
 * Executes a price prediction ratio using trained weights.
 */
export function getResaleRatio(
  xPrice: number,
  xAge: number,
  xCondition: number,
  xEdition: number,
  xCategory: number,
  xDemand: number
): number {
  if (!isModelTrained) {
    // Train asynchronously in background if not done
    trainTensorFlowModel().catch(() => {});
  }

  // Linear formula: bias + w1*x1 + w2*x2 + ...
  const rawRatio = modelBias +
                   modelWeights[0] * xPrice +
                   modelWeights[1] * xAge +
                   modelWeights[2] * xCondition +
                   modelWeights[3] * xEdition +
                   modelWeights[4] * xCategory +
                   modelWeights[5] * xDemand;

  // Clamp ratio between 15% and 90%
  return Math.max(0.15, Math.min(0.90, rawRatio));
}

export function getTrainedMetadata(): ModelMetadata {
  return {
    weights: [...modelWeights],
    mse: rootMeanSquaredError,
    epochs: isModelTrained ? 100 : 0,
    learningRate: 0.05,
    samplesCount: loadPriceHistory().length
  };
}
