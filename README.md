# ERPNext Invoice Manager

A modern React-based web application for managing and tracking invoice payments with real-time updates from ERPNext.

## Features

- View a list of invoices with their payment status
- Filter invoices by status (All, Unpaid, Overdue)
- Select multiple invoices and mark them as paid
- Real-time updates when invoices are modified in ERPNext
- Responsive design that works on desktop and mobile
- Clean, modern UI built with Material-UI

## Prerequisites

- Node.js (v14 or later)
- npm or yarn
- Access to an ERPNext instance with API access
- API credentials (API Key and Secret) from ERPNext

## Setup

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd erpnext-invoice-manager
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory with your ERPNext credentials:
   ```env
   REACT_APP_ERPNEXT_URL=http://your-erpnext-instance
   REACT_APP_API_KEY=your_api_key_here
   REACT_APP_API_SECRET=your_api_secret_here
   ```

4. Start the development server:
   ```bash
   npm start
   ```

5. Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes and show any lint errors in the console.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

### `npm test`

Launches the test runner in interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

## ERPNext Setup

For this application to work with your ERPNext instance, make sure:

1. API access is enabled in your ERPNext instance
2. The API user has the necessary permissions to access Sales Invoices
3. CORS is properly configured in ERPNext to allow requests from your application's domain

## Security Considerations

- Never commit your `.env` file to version control
- Use environment variables for sensitive information
- Ensure your ERPNext instance is secured with HTTPS in production
- Regularly rotate your API keys and secrets

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can’t go back!**

If you aren’t satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you’re on your own.

You don’t have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn’t feel obligated to use this feature. However we understand that this tool wouldn’t be useful if you couldn’t customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
