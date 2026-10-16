# Bakeau

Bakeau is a full-stack bakery marketplace and management platform built with the MERN stack.

The platform allows independent bakeries to create and manage their own online storefront, products, orders, customers, inventory, payments, analytics, and bakery settings from one dashboard.

Customers can browse public bakery storefronts, customize products, add items to a cart, create an account, place orders, select pickup times, track orders, and leave reviews.

Bakeau also includes a Platform Administrator area for approving or suspending bakery accounts and moderating customer reviews.

---

## Live Application

**Website:**  
https://bakeau.com

**Backend API:**  
https://api.bakeau.com

---

## Project Overview

Bakeau was developed as a full-stack web development capstone project.

The main goal of the project is to give small bakeries an easier way to create an online storefront and manage their business without building an individual e-commerce website from scratch.

Bakeau supports three main user roles:

- Customer
- Bakery Owner
- Platform Administrator

---

## Main Features

### Customer

Customers can:

- Browse public bakery storefronts
- View bakery information and products
- View featured products
- Customize bakery products
- Add products to a guest cart
- Register and verify their email
- Log in to their account
- Keep their cart after authentication
- Select pickup dates and times
- Place bakery orders
- View order history
- Track individual orders
- Edit eligible pending orders
- Cancel eligible pending orders
- View payment information
- Leave reviews after completed orders
- Edit or delete their own reviews
- Reset forgotten passwords

---

### Bakery Owner

Bakery Owners can:

- Register a Bakery Owner account
- Complete a multi-step bakery setup
- Configure bakery branding
- Upload bakery logos and images
- Configure bakery location and business information
- Create and manage bakery products
- Create product customization groups and options
- Manage featured products
- Control product visibility and availability
- Manage product inventory
- Manage bakery ingredient inventory
- Receive low-inventory warnings
- Configure pickup availability
- Edit pickup slots
- View customer orders
- Update order status
- Record manual payments
- View customer information
- Reply to customer reviews
- Configure bakery policies
- Configure payment settings
- Connect a Stripe account
- View Stripe account connection status
- View dashboard statistics
- View recent orders
- View items requiring attention
- View sales analytics
- View payment summaries
- Search orders, products, and customers
- Receive dashboard notifications for new orders
- Receive email notifications for new orders
- Update account information and password
- Access Help & Support

---

### Platform Administrator

Platform Administrators can:

- View registered bakery accounts
- View bakery owner information
- Review bakery applications
- Approve bakery accounts
- Suspend bakery accounts
- View customer reviews
- Remove inappropriate reviews

The Platform Administrator also receives an email when a bakery completes setup and is ready for approval.

Bakery Owners receive email notifications when their bakery is approved or suspended.

---

## Notifications and Email

Bakeau includes transactional email and in-app notification functionality.

Emails are currently used for:

- Email verification
- Forgotten password recovery
- New bakery approval requests
- Bakery approval notifications
- Bakery suspension notifications
- New bakery orders
- Customer order status updates

Bakery Owners also receive dashboard notifications when new orders are placed.

---

## Dashboard Search

The Bakery Owner dashboard includes a global search feature that can search:

- Orders
- Products
- Customers

Search results provide quick navigation to the relevant dashboard pages.

---

## Order Status Workflow

Orders move through the following statuses:

```text
Pending
   ↓
Confirmed
   ↓
Preparing
   ↓
Ready
   ↓
Completed
```

Orders may also be cancelled when allowed.

Customers receive an email when the Bakery Owner updates the order status.

---

## Bakery Approval Workflow

```text
Bakery Owner creates account
        ↓
Completes bakery setup
        ↓
Bakery remains Pending
        ↓
Platform Administrator receives email
        ↓
Administrator reviews bakery
        ↓
Approve / Suspend
        ↓
Bakery Owner receives status email
```

Only approved bakeries are publicly accessible through the storefront.

---

## Technology Stack

### Frontend

- React
- Vite
- JavaScript
- HTML
- CSS
- Bootstrap
- React Router
- Lucide React

### Backend

- Node.js
- Express.js
- REST APIs
- JWT Authentication
- bcryptjs
- express-validator

### Database

- MongoDB
- Mongoose

### Media

- Cloudinary

### Email

- Resend
- Custom Bakeau email domain

### Payments

- Stripe
- Stripe Connect

### Deployment

- Cloudflare Pages
- Render
- MongoDB Atlas
- Cloudflare DNS

---

## Project Structure

```text
Bakeau/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── config/
│   │   └── ...
│   │
│   └── package.json
│
├── server/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   ├── config/
│   ├── index.js
│   └── package.json
│
└── README.md
```

---

## Authentication

Bakeau uses JWT-based authentication.

Protected backend routes use authentication middleware to verify the user's token.

Role-based authorization is used to restrict functionality between:

```text
customer
bakeryOwner
platformAdmin
```

Passwords are hashed using bcrypt before they are stored in MongoDB.

---

## Main Database Models

Bakeau uses multiple MongoDB collections including:

- User
- Bakery
- Product
- CustomizationGroup
- CustomizationOption
- Order
- OrderItem
- OrderItemCustomization
- OrderActivity
- PickupSlot
- Review
- Ingredient
- Notification

---

## Product Customization

Bakery Owners can create customization groups for products.

Examples include:

```text
Cake Size
- Small
- Medium
- Large

Flavour
- Chocolate
- Vanilla
- Red Velvet

Extra Toppings
- Strawberries
- Chocolate Drizzle
- Sprinkles
```

Customization pricing is calculated and validated by the backend.

The frontend does not control trusted product pricing.

---

## Order Pricing

Order prices are calculated by the backend using stored product and customization prices.

Bakeau supports:

- Full payment
- Deposits
- Manual payments

The backend stores values such as:

```text
total_price
amount_due_now
amount_paid
payment_status
```

This prevents the frontend from being trusted for order pricing.

---

## Payments

Bakery Owners can connect their Stripe account through Stripe Connect.

The platform currently supports:

- Stripe account creation
- Stripe onboarding
- Stripe connection status
- Bakery payment settings
- Manual payment tracking

### In Progress

Customer Stripe checkout/payment processing is the final major payment feature currently being completed.

---

## Analytics

The Bakery Owner Analytics page includes:

- Revenue
- Order totals
- Completed orders
- Customer statistics
- Date filtering
- Previous-period comparison
- Sales graph

Analytics data is generated from real bakery order information stored in MongoDB.

---

## Inventory

Bakeau includes both product and ingredient inventory management.

Bakery Owners can:

- Track product inventory
- Update stock quantities
- Track ingredients
- View low-stock warnings
- Identify products that require attention

---

## Reviews

Customers can leave reviews after completing an order.

Customers can:

- Add a review
- Edit their review
- Delete their review

Bakery Owners can:

- View reviews
- Reply to customer reviews

Platform Administrators can:

- View all reviews
- Remove inappropriate reviews

---

## Responsive Design

Bakeau was designed to work across:

- Desktop
- Tablet
- Mobile

Bootstrap is used for the majority of layout, spacing, responsive grids, alignment, and utility classes.

Custom CSS is used primarily for Bakeau-specific visual styling and branding.

---

## Running the Project Locally

### 1. Clone the Repository

```bash
git clone https://github.com/Lovepreet0199/Bakeau.git
```

```bash
cd Bakeau
```

---

### 2. Install Frontend Dependencies

```bash
cd client
npm install
```

---

### 3. Install Backend Dependencies

Open another terminal:

```bash
cd server
npm install
```

---

### 4. Configure Environment Variables

Create the required environment files.

Example backend variables:

```env
PORT=3000

MONGODB_URI=

JWT_SECRET=

CLIENT_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

RESEND_API_KEY=

STRIPE_SECRET_KEY=

ADMIN_NOTIFICATION_EMAIL=
```

Do not commit real environment variables or secret API keys to GitHub.

---

### 5. Start the Backend

From the `server` directory:

```bash
npm run dev
```

---

### 6. Start the Frontend

From the `client` directory:

```bash
npm run dev
```

The application will normally run at:

```text
Frontend:
http://localhost:5173

Backend:
http://localhost:3000
```

---

## Production

Bakeau currently uses:

```text
Frontend:
Cloudflare Pages

Backend:
Render

Database:
MongoDB Atlas

Images:
Cloudinary

Email:
Resend
```

Production environment variables are configured through the hosting platforms rather than stored in the repository.

---

## Current Development Status

Most major Bakeau functionality is complete.

### Completed

- Authentication
- Email verification
- Password recovery
- Bakery onboarding
- Bakery approval system
- Public storefront
- Product management
- Product customizations
- Guest cart
- Customer checkout
- Order creation
- Pickup scheduling
- Order management
- Manual payment tracking
- Customer order tracking
- Reviews
- Inventory
- Marketing / Featured Products
- Analytics
- Dashboard overview
- Dashboard search
- In-app notifications
- Transactional emails
- Bakery settings
- Admin moderation
- Production deployment

### Remaining

- Customer Stripe payment checkout
- Final end-to-end testing
- Final bug fixes and UI polish

---

## Future Improvements

Possible future improvements include:

- Customer favourites
- Additional storefront themes
- Advanced bakery analytics
- Additional notification types
- Automated refunds
- Advanced Stripe payment reporting
- Delivery support
- Custom bakery domains
- Promotional discount codes
- Bakery subscriptions
- Mobile application

---

## Developer

**Lovepreet Singh Sandhu**

Web Development Graduate Certificate  
Humber Polytechnic

GitHub:  
https://github.com/Lovepreet0199

Portfolio:  
https://lovesandhu.com

---

## License

This project was developed as an educational capstone project.

All rights reserved.
