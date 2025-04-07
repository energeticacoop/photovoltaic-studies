# Energética Coop's Photovoltaic Studies

## 📖 Project Description

The **Energética Coop's Photovoltaic Studies** project is a Google Apps Script (GAS) solution designed to operate within a Google Sheets spreadsheet. It automates the generation of photovoltaic studies and streamlines the process of generating documentation for the engineering team.

This automation significantly reduces the time spent on manual calculations and document creation, making the process more efficient and error-free. The goal is to provide an assisted, time-saving solution that enhances the workflow for the team.

---

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

---

## 🧑‍💻 Preferred Workflow

1. **Create a feature branch from `dev`:**

   ```bash
   git checkout dev
   git pull origin dev
   git checkout -b feature/my-new-feature
   ```

2. **Push changes to `dev`:**

   ```bash
   git push origin feature/my-new-feature
   ```

3. **Create a PR to `dev` on GitHub.**

---

## 🚀 Deployment Workflow

- **Push to `dev` →** Runs tests and deploys to the **dev Google Sheet**.
- **Push to `main` →** Runs tests and deploys to the **prod Google Sheet**.

The deployment to Google Sheets is managed using [**clasp**](https://github.com/google/clasp), a command-line tool for managing Google Apps Script projects. The workflows are set up to automatically deploy the code to the correct environment (either `dev` or `prod`) after successful tests.

---

## 🧪 Testing with Mocha

We use [**Mocha**](https://mochajs.org/) for testing the JavaScript code. Mocha is a feature-rich JavaScript test framework running on Node.js, making asynchronous testing simple and fun.

Tests are located in the `test` directory and can be run locally using:

```bash
npm test
```
