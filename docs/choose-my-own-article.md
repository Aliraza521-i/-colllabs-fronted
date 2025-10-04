# Choose My Own Article Component

## Overview
The "Choose My Own Article" component allows advertisers to create and submit their own articles for website placements. This component is part of the shopping cart workflow where advertisers can either choose to have the publisher write an article or write their own.

## Features
- Project selection dropdown
- Article details form with validation
- Meta tags section for SEO
- Responsive design matching the application's theme

## Form Fields

### Article Details
1. **Article Title** - The title of the article
2. **Permalink Slug** - URL-friendly version of the title
3. **Anchor Text** - Text for the backlink
4. **Target URL** - Destination URL for the backlink
5. **Post Text** - Main content of the article (large text area)

### Meta Tags
1. **Meta Title** - SEO title for the article
2. **Meta Keywords** - Comma-separated keywords
3. **Meta Description** - Brief description of the article content

## Usage
The component is accessible through the shopping cart when an advertiser selects "Write my own article" for a website placement.

## Route
- `/advertiser/write-own-article/:itemId`

## Dependencies
- `CartContext` for managing cart state
- `AuthContext` for user authentication
- React Router for navigation

## Implementation Details
- Form data is stored in component state
- Project selection is populated from user's projects
- Form validation is handled through HTML5 validation
- Article data is saved to the cart context upon submission