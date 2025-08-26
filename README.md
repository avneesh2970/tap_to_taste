# Restaurant Ordering Platform

A comprehensive full-stack restaurant ordering platform with three separate interfaces: Superadmin Dashboard, Admin Dashboard, and User Menu System.

## 🏗️ Architecture

### Backend (Node.js + Express + MongoDB)
- RESTful API with JWT authentication
- Real-time updates with Socket.io
- Image upload with Cloudinary
- QR code generation
- Role-based access control

### Frontend Applications

#### 1. Superadmin Dashboard (Port 3000)
- **Theme**: Dark with blue accents
- **Features**: Platform management, admin oversight, analytics
- **Access**: Password-only login (no signup)

#### 2. Admin Dashboard (Port 3001)
- **Theme**: Light with green accents
- **Features**: Restaurant management, dish management, order tracking
- **Access**: Signup and login for restaurant owners

#### 3. User Menu System (Port 3002)
- **Theme**: Warm, food-friendly colors
- **Features**: QR code access, menu browsing, ordering, order tracking
- **Access**: No authentication required

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Cloudinary account (for image uploads)

### Installation

1. **Clone the repository**
\`\`\`bash
git clone <repository-url>
cd restaurant-platform
\`\`\`

2. **Backend Setup**
\`\`\`bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
\`\`\`

3. **Superadmin Frontend**
\`\`\`bash
cd superadmin-frontend
npm install
npm run dev
\`\`\`

4. **Admin Frontend**
\`\`\`bash
cd admin-frontend
npm install
npm run dev
\`\`\`

5. **User Frontend**
\`\`\`bash
cd user-frontend
npm install
npm run dev
\`\`\`

## 🔧 Environment Variables

### Backend (.env)
\`\`\`
MONGODB_URI=mongodb://localhost:27017/restaurant-platform
JWT_SECRET=your-jwt-secret-key
CLOUDINARY_CLOUD_NAME=your-cloudinary-cloud-name
CLOUDINARY_API_KEY=your-cloudinary-api-key
CLOUDINARY_API_SECRET=your-cloudinary-api-secret
SUPERADMIN_PASSWORD=your-superadmin-password
PORT=5000
\`\`\`

## 📱 Usage

### For Superadmins
1. Visit `http://localhost:3000`
2. Login with the superadmin password
3. Manage platform, view analytics, oversee admins

### For Restaurant Owners
1. Visit `http://localhost:3001`
2. Sign up for a new account
3. Create restaurant profile
4. Add dishes and manage orders
5. Download QR code for customers

### For Customers
1. Scan restaurant QR code or visit `http://localhost:3002/menu/:restaurantId`
2. Browse menu and add items to cart
3. Checkout with customer details
4. Track order status in real-time

## 🎨 Design Features

- **Responsive Design**: Mobile-first approach for all interfaces
- **Real-time Updates**: Socket.io integration for live order tracking
- **Smooth Animations**: Framer Motion animations throughout
- **Professional UI**: Tailwind CSS with custom color schemes
- **Accessibility**: WCAG compliant with proper ARIA labels

## 🔐 Security Features

- JWT authentication with role-based access
- Password hashing with bcrypt
- CORS protection
- Input validation and sanitization
- Secure file upload handling

## 📊 Key Features

### Real-time Functionality
- Live order status updates
- New order notifications
- Real-time analytics updates
- Socket.io powered communication

### Payment Integration
- Cash payment option
- UPI payment support
- Digital receipt generation
- Order confirmation system

### Management Tools
- Comprehensive admin dashboards
- Analytics and reporting
- User management
- Restaurant performance tracking

## 🛠️ Technology Stack

**Backend:**
- Node.js + Express.js
- MongoDB + Mongoose
- Socket.io
- JWT Authentication
- Cloudinary
- QR Code Generator

**Frontend:**
- React 18 + Vite
- Tailwind CSS
- Framer Motion
- Socket.io Client
- React Router
- Context API

## 📞 Support

For technical support or questions, please refer to the documentation or contact the development team.

## 📄 License

This project is licensed under the MIT License.
