# Shopping Cart Implementation

## Overview
The shopping cart functionality allows advertisers to add websites to their cart for later purchase. The implementation uses React Context API to manage the cart state across the application.

## Components

### CartContext
- **Location**: `src/contexts/CartContext.jsx`
- **Purpose**: Manages the global cart state
- **Features**:
  - Add items to cart
  - Remove items from cart
  - Clear entire cart
  - Persist cart data in localStorage
  - Calculate total items and price

### ShoppingCart Component
- **Location**: `src/pages/advertiser/components/ShoppingCart.jsx`
- **Purpose**: Displays the contents of the cart
- **Features**:
  - Shows all items in the cart
  - Allows removal of items
  - Displays order summary with pricing
  - Provides checkout functionality

### WebsiteBrowsing Component
- **Location**: `src/pages/advertiser/components/WebsiteBrowsing.jsx`
- **Purpose**: Allows advertisers to browse websites and add them to cart
- **Features**:
  - "Add to Cart" button on each website card
  - Uses cart context to manage items

### AdvertiserHeader Component
- **Location**: `src/pages/advertiser/components/AdvertiserHeader.jsx`
- **Purpose**: Shows cart item count in the header
- **Features**:
  - Dynamic badge showing number of items in cart
  - Navigation to shopping cart page

## Usage

### Adding Items to Cart
1. Navigate to "Browse Websites" in the advertiser dashboard
2. Click the "Add to Cart" button on any website card
3. The item will be added to the cart and the header badge will update

### Viewing Cart
1. Click the shopping cart icon in the header
2. Or navigate to `/advertiser/cart` directly
3. View all items in the cart with pricing details

### Removing Items
1. In the shopping cart page, click the "X" icon next to any item
2. The item will be removed and totals will update automatically

## Data Persistence
Cart data is automatically saved to localStorage and restored when the application is reopened.

## Technical Details
- Uses React Context API for state management
- Implements useReducer for complex state logic
- Persists data using localStorage
- Follows the application's styling conventions