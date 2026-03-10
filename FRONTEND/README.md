# RetailHub - Order Retail Management System

A modern, responsive order retail management system built with React.js and TypeScript. This application provides a comprehensive user dashboard for browsing products, managing shopping cart, and handling user authentication.

![RetailHub Dashboard](https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&h=400&fit=crop)

## 🌟 Features

### 🏠 Dashboard
- **Homepage Overview**: Comprehensive overview of the retail platform
- **Featured Products**: Showcase of trending and popular items
- **Category Navigation**: Easy browsing through different product categories
- **Stats Display**: Key metrics and performance indicators
- **Newsletter Subscription**: User engagement features

### 🛍️ Product Management
- **Product Catalog**: Browse through extensive product collections
- **Advanced Filtering**: Filter by category, price range, rating, and availability
- **Search Functionality**: Powerful search with real-time results
- **Product Details**: Detailed product information with images and reviews
- **Sort Options**: Sort by name, price, rating, and other criteria
- **Grid/List Views**: Flexible product display options

### 🛒 Shopping Cart
- **Save for Later**: Persistent cart functionality across sessions
- **Quantity Management**: Easy quantity updates with stock validation
- **Price Calculation**: Real-time total calculations with tax and shipping
- **Smart Recommendations**: Suggested products based on cart items
- **Shipping Calculator**: Dynamic shipping cost calculation
- **Stock Notifications**: Low stock and out-of-stock alerts

### 🔐 User Authentication
- **User Registration**: Complete signup process with validation
- **Secure Login**: Authentication with session management
- **Password Security**: Secure password handling
- **Social Login**: Google and Facebook login integration (UI ready)
- **User Profile**: Account management and order history

### 📱 Responsive Design
- **Mobile-First**: Optimized for all screen sizes
- **Cross-Browser**: Compatible with modern browsers
- **Accessibility**: WCAG compliant design patterns
- **Performance**: Optimized for fast loading and smooth interactions

## 🚀 Quick Start

### Prerequisites
- Node.js 16.x or higher
- npm or yarn package manager

### Installation

1. **Clone the repository** (or use existing directory):
   ```bash
   cd C:/MICROSERVICES/FRONTEND
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Open your browser**:
   Navigate to `http://localhost:5173/`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🏗️ Architecture

### Tech Stack
- **Frontend Framework**: React 18+ with TypeScript
- **Build Tool**: Vite for fast development and building
- **Routing**: React Router DOM for navigation
- **State Management**: React Context API
- **Styling**: Modern CSS with CSS Variables
- **Icons**: React Icons (Feather Icons)
- **Development**: TypeScript for type safety

### Project Structure
```
src/
├── components/           # Reusable UI components
│   ├── Auth/            # Authentication components
│   ├── Cart/            # Shopping cart components
│   ├── Dashboard/       # Dashboard and homepage
│   ├── Navigation/      # Navigation and header
│   └── Products/        # Product-related components
├── context/             # React Context providers
│   ├── AuthContext.tsx  # Authentication state management
│   └── CartContext.tsx  # Shopping cart state management
├── pages/               # Page-level components
│   └── Products.tsx     # Products listing page
├── types/               # TypeScript type definitions
├── utils/               # Utility functions and mock data
├── styles/              # Global styles and themes
├── App.tsx             # Main application component
└── main.tsx            # Application entry point
```

### State Management
- **Authentication**: Managed through AuthContext
  - User login/logout functionality
  - Session persistence with localStorage
  - User profile management

- **Shopping Cart**: Managed through CartContext
  - Add/remove items functionality
  - Quantity updates with validation
  - Local storage persistence
  - Price calculations

## 🎨 Features Overview

### Navigation
- Responsive header with search functionality
- User authentication status
- Shopping cart indicator with item count
- Mobile-friendly hamburger menu

### Product Browsing
- Category-based filtering
- Price range filters
- Search with real-time results
- Product ratings and reviews
- Stock status indicators

### Shopping Experience
- One-click add to cart
- Quantity management
- Shipping calculations
- Order summary
- Recommended products

### User Interface
- Modern, clean design
- Intuitive navigation
- Consistent color scheme
- Responsive layouts
- Smooth animations

## 🔧 Configuration

### Environment Setup
The application uses Vite's built-in environment handling. For production deployment, ensure proper environment variables are configured.

### Customization
- **Colors**: Modify CSS variables in `src/index.css`
- **Branding**: Update logo and brand name in navigation component
- **Products**: Modify mock data in `src/utils/mockData.ts`
- **Categories**: Update categories in the same file

## 📱 Responsive Design

The application is built with mobile-first principles:
- **Mobile**: 320px - 768px
- **Tablet**: 768px - 1024px  
- **Desktop**: 1024px and above

### Responsive Features
- Collapsible navigation menu
- Flexible grid layouts
- Touch-friendly buttons
- Optimized images
- Mobile-optimized forms

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Various Platforms
- **Vercel**: Connect GitHub repository for automatic deployment
- **Netlify**: Drag and drop `dist` folder or connect repository
- **AWS S3**: Upload `dist` folder contents to S3 bucket
- **GitHub Pages**: Use GitHub Actions for automated deployment

## 🔮 Future Enhancements

### Planned Features
- [ ] Real backend API integration
- [ ] Payment gateway integration
- [ ] Order tracking functionality
- [ ] Admin dashboard
- [ ] Product reviews and ratings
- [ ] Wishlist functionality
- [ ] Multi-language support
- [ ] Dark mode theme
- [ ] Advanced search filters
- [ ] Inventory management

### Technical Improvements
- [ ] Unit and integration tests
- [ ] Performance optimization
- [ ] SEO improvements
- [ ] PWA capabilities
- [ ] Real-time notifications
- [ ] Advanced error handling
- [ ] Analytics integration

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔗 Related Links

- [React Documentation](https://reactjs.org/)
- [Vite Documentation](https://vitejs.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [React Router](https://reactrouter.com/)

---

**Built with ❤️ using React, TypeScript, and modern web technologies.**
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
