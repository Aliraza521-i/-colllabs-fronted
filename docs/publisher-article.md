# Publisher Article Component

## Overview
The "Article" component for publishers allows them to create and submit their own articles for advertiser orders. This component is part of the sales workflow where publishers can either write their own articles or use content provided by advertisers.

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
The component is accessible through the publisher sales page via the "Article" link in the sidebar.

## Route
- `/publisher/sales/article`

## Dependencies
- React Router for navigation

## Implementation Details
- Form data is stored in component state
- Project selection is populated with mock data (would be replaced with actual API data)
- Form validation is handled through HTML5 validation
- Article data submission would connect to backend API in a real implementation