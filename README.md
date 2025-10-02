# AYU CONNECT - Healthcare Records System

A full-stack web application that enables patients to securely share their DigiLocker medical records with hospitals in real-time using Aadhaar login and QR code-based access.

## Features

- **Secure Authentication**: Aadhaar + OTP based login
- **Medical Records Management**: View and manage DigiLocker medical records
- **Secure Sharing**: Generate temporary QR codes for sharing selected records
- **Time-Limited Access**: All shared access expires automatically
- **Access Logs**: Track when and how your records were accessed
- **Blockchain Integration**: Optional logging of access events on blockchain

## Project Structure

- `server/` - Node.js backend with Express.js
  - `auth.js` - Handles Aadhaar + OTP login
  - `records.js` - Fetches medical records from DigiLocker (mock data)
  - `share.js` - Generates secure, time-limited access tokens and QR links
  - `blockchain.js` - Logs access history using a Solidity smart contract
- `frontend/` - React.js frontend
  - `AadhaarLogin.js` - Aadhaar + OTP authentication UI
  - `Dashboard.js` - Patient dashboard after login
  - `RecordsList.js` - Display and select medical reports
  - `ShareRecords.js` - Generate QR code with a secure link
  - `ScanQR.js` - Hospital view to access shared reports
  - `AccessLogs.js` - View of previous accesses using blockchain logs
- `contracts/AccessLog.sol` - Ethereum smart contract to log data access events

## Tech Stack

- **Backend**: Node.js, Express.js, JWT
- **Frontend**: React.js, qrcode.react
- **Optional**: Solidity (for access logging), Web3.js

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- MongoDB (optional, for production)
- Ganache (optional, for blockchain features)

### Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/ayu-connect.git
   cd ayu-connect
   ```

2. Install backend dependencies
   ```
   cd server
   npm install
   ```

3. Install frontend dependencies
   ```
   cd ../frontend
   npm install
   ```

### Running the Application

1. Start the backend server
   ```
   cd server
   npm run dev
   ```

2. Start the frontend development server
   ```
   cd frontend
   npm start
   ```

3. Open your browser and navigate to `http://localhost:3000`

## Security Features

- All QR links are temporary and validated by the backend before access
- JWT-based authentication
- Tokens expire after a configurable time period
- Access can be revoked by the patient at any time
- All access events are logged and can be viewed by the patient

## Deployment

For production deployment:

1. Set environment variables in `.env` file
2. Build the frontend
   ```
   cd frontend
   npm run build
   ```
3. Start the production server
   ```
   cd ../server
   npm start
   ```

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- DigiLocker for secure document storage
- Aadhaar for identity verification
- Ethereum blockchain for immutable access logs