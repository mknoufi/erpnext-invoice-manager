# ERPNext Invoice Manager

A modern, production-ready React application for managing invoices with ERPNext integration, featuring a comprehensive POS system, cashier balance reconciliation, and advanced analytics.

## 🚀 Features

### Core Functionality
- **Invoice Management**: Create, edit, and manage invoices with real-time ERPNext sync
- **POS System**: Complete point-of-sale functionality with cashier workflows
- **Cashier Balance**: Advanced cash reconciliation with denomination counting
- **Payment Integration**: Multi-gateway payment processing (Stripe, PayPal, Bank Transfer)
- **Analytics Dashboard**: Real-time insights and reporting
- **PWA Support**: Progressive Web App with offline capabilities

### Security & Compliance
- **Two-Factor Authentication**: Enhanced security with 2FA setup
- **Audit Logging**: Comprehensive activity tracking
- **Role-Based Access**: Granular permission system
- **Data Encryption**: Secure data handling and storage

### Modern UI/UX
- **Responsive Design**: Optimized for all screen sizes
- **Material-UI Components**: Modern, accessible interface
- **Dark/Light Themes**: Customizable appearance
- **Real-time Updates**: Live data synchronization

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Material-UI
- **State Management**: React Context API, TanStack Query
- **Build Tool**: Create React App with custom configuration
- **Testing**: Jest, React Testing Library
- **PWA**: Service Worker, Web App Manifest
- **Backend Integration**: ERPNext v15 API

## 📦 Installation

### Prerequisites
- Node.js 18+ (recommended: Node.js 20+)
- npm 9+
- ERPNext instance (v15+)

### Setup
```bash
# Clone the repository
git clone https://github.com/yourusername/erpnext-invoice-manager.git
cd erpnext-invoice-manager

# Install dependencies
npm install --legacy-peer-deps

# Configure environment variables
cp .env.example .env
# Edit .env with your ERPNext configuration

# Start development server
npm start
```

### Environment Configuration
Create a `.env` file with the following variables:
```env
REACT_APP_ERPNEXT_URL=https://your-erpnext-instance.com
REACT_APP_ERPNEXT_API_KEY=your_api_key
REACT_APP_ERPNEXT_API_SECRET=your_api_secret
REACT_APP_ERPNEXT_COMPANY=your_company
REACT_APP_LOG_LEVEL=debug
REACT_APP_ENABLE_TELEMETRY=false
```

## 🏗️ Project Structure

```
src/
├── api/                    # API services and client
├── components/             # React components
│   ├── analytics/         # Analytics dashboard
│   ├── common/            # Reusable components
│   ├── payments/          # Payment processing
│   ├── pos/              # Point of sale system
│   ├── security/         # Authentication & security
│   └── settings/         # Configuration panels
├── contexts/              # React contexts
├── hooks/                 # Custom React hooks
├── pages/                 # Page components
├── services/              # Business logic services
├── types/                 # TypeScript type definitions
└── utils/                 # Utility functions
```

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run specific test file
npm test -- --testPathPattern=Simple.test.tsx
```

## 🏭 Building for Production

```bash
# Create production build
npm run build

# Build without source maps (recommended)
npm run build
```

The build artifacts will be stored in the `build/` directory.

## 🔧 Development

### Available Scripts
- `npm start` - Start development server
- `npm test` - Run test suite
- `npm run build` - Create production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript compiler

### Code Quality
- **ESLint**: Configured with React and TypeScript rules
- **TypeScript**: Strict type checking enabled
- **Prettier**: Code formatting (optional)
- **Husky**: Pre-commit hooks (recommended)

## 📱 PWA Features

- **Offline Support**: Works without internet connection
- **Install Prompt**: Add to home screen
- **Background Sync**: Sync data when online
- **Push Notifications**: Real-time updates
- **Caching**: Intelligent data caching

## 🔐 Security Features

- **JWT Authentication**: Secure token-based auth
- **2FA Support**: Two-factor authentication
- **Audit Logging**: Track all user actions
- **Input Validation**: Comprehensive data validation
- **XSS Protection**: Cross-site scripting prevention

## 📊 Analytics & Reporting

- **Sales Analytics**: Revenue trends and insights
- **Payment Analytics**: Payment method analysis
- **Cashier Reports**: Daily reconciliation reports
- **Performance Metrics**: System performance monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines
- Follow TypeScript best practices
- Write tests for new features
- Update documentation as needed
- Follow the existing code style

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check the `/docs` folder for detailed guides
- **Issues**: Report bugs via GitHub Issues
- **Discussions**: Use GitHub Discussions for questions

## 🗺️ Roadmap

### Upcoming Features
- [ ] Mobile app (React Native)
- [ ] Advanced reporting
- [ ] Multi-currency support
- [ ] Inventory management
- [ ] Customer management
- [ ] Advanced analytics

### Recent Updates
- ✅ Cashier balance reconciliation system
- ✅ PWA implementation
- ✅ Advanced analytics dashboard
- ✅ Multi-gateway payment integration
- ✅ Security enhancements
- ✅ Code optimization and cleanup

## 🙏 Acknowledgments

- ERPNext community for the excellent backend system
- Material-UI team for the component library
- React team for the amazing framework
- All contributors who helped make this project better

---

**Made with ❤️ for modern businesses**