# BookBridge AI Pricing Recommendation System

This document outlines the local multivariable linear regression model implemented in BookBridge AI to recommend fair book resale values.

---

## 1. Regression Equation & Factors

Resale pricing suggestions are generated using a **multivariable linear regression model** running locally in TypeScript. The output of the hypothesis is a percentage multiplier of the cover price:

\[
h_\theta(x) = \theta_0 + \theta_1 x_1 + \theta_2 x_2 + \theta_3 x_3 + \theta_4 x_4 + \theta_5 x_5
\]

Where:
*   \(\theta_0\): Bias (constant offset).
*   \(x_1\): Cover Price (normalized).
*   \(x_2\): Depreciation over age (years).
*   \(x_3\): Physical condition quality score (1 to 5).
*   \(x_4\): Publication Edition weight.
*   \(x_5\): Category demand multiplier.

Suggested resale value is:
\[
Suggested = coverPrice \times \text{clamp}(0.15, 0.90, h_\theta(x))
\]

---

## 2. Feature Normalization & Scales

To avoid weight explosion during gradient optimization, input metrics are scaled between 0 and 1:

1.  **Cover Price (\(x_1\))**: \(\text{MRP} / 2000\)
2.  **Depreciation Age (\(x_2\))**: \(\text{Age in Years} / 5\)
3.  **Physical Condition (\(x_3\))**: \(\text{Score} / 5\)
    *   *New*: 5/5
    *   *Like New*: 4.5/5
    *   *Very Good*: 4/5
    *   *Good*: 3/5
    *   *Fair*: 2/5
4.  **Edition (\(x_4\))**: \(\text{Edition Number} / 5\)
5.  **Category Demand (\(x_5\))**: Hardcoded constants mapping:
    *   *Artificial Intelligence*: 1.2
    *   *Web Development*: 1.1
    *   *Programming*: 1.0
    *   *Novels*: 0.6
    *   *Mathematics*: 0.7

---

## 3. Training & Gradient Descent Optimization

Every query trains the parameters \(\theta\) dynamically on `/data/book-price-data.json` over 1500 epochs with a learning rate \(\alpha = 0.03\).

### Cost function (Mean Squared Error)
\[
J(\theta) = \frac{1}{2m} \sum_{i=1}^{m} (h_\theta(x^{(i)}) \cdot \text{MRP}^{(i)} - y^{(i)})^2
\]

### Weight Update Rules
For each weight \(\theta_j\):
\[
\theta_j := \theta_j - \alpha \frac{\partial J(\theta)}{\partial \theta_j}
\]
\[
\frac{\partial J(\theta)}{\partial \theta_j} = \frac{1}{m} \sum_{i=1}^{m} (Suggested^{(i)} - y^{(i)}) \times \text{MRP}^{(i)} \times x_j^{(i)}
\]

---

## 4. Diagnostics & MSE Analytics

Model errors are evaluated using Root Mean Squared Error (RMSE) in INR:
\[
RMSE = \sqrt{\frac{1}{m} \sum_{i=1}^{m} (Suggested^{(i)} - y^{(i)})^2}
\]

Admins can review live parameters, iterations, error margins, and seller recommendation adherence rates at the Admin **AI Price Analytics** dashboard (`/admin/ai-analytics`).
