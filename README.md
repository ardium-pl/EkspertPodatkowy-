# EkspertPodatkowy - Invoice OCR and Data Extraction

## Overview

EkspertPodatkowy is an automated system for processing invoices using Optical Character Recognition (OCR) and AI-powered data extraction. It converts PDF invoices to structured data, making it easier to analyze and manage financial information.

## Features

- PDF to image conversion
- OCR processing using Google Vision API
- AI-powered data extraction using OpenAI's GPT-4 with Structured Outputs
- Structured data output in JSON format

## Prerequisites

- Node.js (v14 or higher)
- Google Cloud Vision API credentials
- OpenAI API key

## Setup

1. Clone the repository:
   ```
   git clone https://github.com/your-username/EkspertPodatkowy.git
   cd EkspertPodatkowy
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory and add the following:
   ```
   GOOGLE_CLIENT_EMAIL=your_google_client_email
   GOOGLE_PRIVATE_KEY=your_google_private_key
   OPENAI_API_KEY=your_openai_api_key
   ```

## Usage

1. Place your PDF invoices in the `input-pdf` folder.

2. Run the main script:
   ```
   node main.js
   ```

3. Check the `output-text` folder for the extracted data in JSON format.

## Project Structure

```
EkspertPodatkowy/
├── images/
├── input-pdf/
├── node_modules/
├── output-text/
├── server/
│   ├── database.js
│   └── google-api.js
├── services/
│   ├── invoice-data-service.js
│   ├── ocr.js
│   └── structured-ocr-parser.js
├── utils/
│   ├── convertPdfToImage.js
│   ├── deleteFile.js
│   ├── downloadFile.js
│   ├── replacePolishCharacters.js
│   └── valuesAdjustment.js
├── .env
├── .gitignore
├── backup.js
├── main.js
├── package.json
├── package-lock.json
└── README.md
```

- `images/`: Temporary storage for converted PDF images
- `input-pdf/`: Directory for input PDF invoices
- `output-text/`: Directory for OCR results and parsed JSON data
- `server/`: Server-side scripts (Google API integration, database operations)
- `services/`: Core functionality (OCR, data parsing)
- `utils/`: Utility functions
- `main.js`: Entry point of the application

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

This project is licensed under the MIT License.