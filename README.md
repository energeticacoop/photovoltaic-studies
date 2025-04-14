# Energética Coop's Photovoltaic Studies

[![clasp](https://img.shields.io/badge/built%20with-clasp-4285f4.svg)](https://github.com/google/clasp)

## 📖 Project Description

The **Energética Coop's Photovoltaic Studies** project is a Google Apps Script (GAS) solution designed to operate within a Google Sheets spreadsheet. It automates the generation of photovoltaic studies and streamlines the process of generating documentation for the engineering team.

This automation significantly reduces the time spent on manual calculations and document creation, making the process more efficient and error-free. The goal is to provide an assisted, time-saving solution that enhances the workflow for the team.

## 🛠️ Setting Up the Local Development Environment

1. **Clone the repo:**

   ```bash
   git clone https://github.com/energeticacoop/photovoltatic-studies.git
   cd photovoltaic-studies
   ```

2. **Install dependencies:**

   ```bash
   npm install
   npm install -g @google/clasp
   ```

3. **Ensure Node.js is installed:**
   ```bash
   node -v
   ```

## 🧑‍💻 Preferred Development Workflow

1. **Work directly on the `dev` branch:**

   ```bash
   git checkout dev
   git pull origin dev
   ```

2. **Make your changes locally and commit them:**

   ```bash
   git commit -am "Your descriptive commit message"
   ```

3. **Push your changes to the `dev` branch:**

   ```bash
   git push origin dev
   ```

   This will automatically deploy to the **dev Google Sheet** for testing.

4. **Test and verify your changes in the dev environment.**

5. **Once everything looks good, open a Pull Request from `dev` → `main`.**  
   Merging to `main` will trigger deployment to the **production Google Sheet**.

## 🚀 Deployment Workflow

- **Push to `dev`** → Automatically deploys to the **dev Google Sheet**.
- **Merge to `main`** → Automatically deploys to the **prod Google Sheet**.

Deployments are powered by [**clasp**](https://github.com/google/clasp), which integrates with CI/CD workflows to handle publishing to the correct environment.

## 🧪 Testing with Mocha

We use [**Mocha**](https://mochajs.org/) for testing the JavaScript code. Mocha is a feature-rich JavaScript test framework running on Node.js, making asynchronous testing simple and fun.

Tests are located in the `test` directory and can be run locally using:

```bash
npm test
```
