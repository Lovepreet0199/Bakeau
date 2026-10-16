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
