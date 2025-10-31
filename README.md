# Morrisons Developer Task

This document outlines the full technical assessment brief focused on React and TypeScript.

The task is to build a version of Morrisons Storefinder.  
Example: [https://www.morrisons.com/storefinder/](https://www.morrisons.com/storefinder/)

## Core Objective

Build a 'Store Finder' web application for Morrisons.

We suggest creating a number of screens to fully showcase your creativity, as an suggestion these could include:

### Screen 1

- An input for a user to search for stores by postcode
- A button to search for stores via their current location

### Screen 2

- Display a list of stores from the search results in screen one
- Stores should be shown as a list as well as an interactive map
- Each store should link to a store details page

### Screen 3

- Display store details, including:
  - Opening times
  - Location
  - Store services and department

The only constraint is that the app should be built using React and TypeScript.  
You are free to use any other libraries of your choosing to help with the build - your choice of libraries will be taken into consideration.

### Branding

**The branding colours are:**  
Green: #008033  
Yellow: #fabb00

The logo is enclosed.

A Swagger and Postman collection is included for the API reference.

## Core Features

### Store Search Results

- Search for stores by postcode and by user location (using the browser's geolocation API).
- Handle location permission denial gracefully (offer postcode fallback).
- Display search results sorted by distance where applicable.
- Desktop view: list of stores with an interactive map beside it.
- Mobile view: tabbed interface toggling between 'List' and 'Map'.
- Display an interactive map of the stores
- Each map marker should link to the correct store detail page.

### Store Details

- Support filtering (e.g. Open now, has pharmacy).
- Store details must be cached for 30 minutes and link to a route (e.g. /store/:id).
- Allow saving a store to favourites, persisted locally (e.g. localStorage).

## Brand and Design

- You may use a UI component library of your choice, themed to the Morrisons Brand
- Use Morrisons header and footer - look at our existing websites for direction
- Apply the provided colour palette and logo for consistent branding.
- Design the main Store Finder body freely with responsive design principles.

## SEO and Accessibility

The app should demonstrate SEO-friendly structure, metadata, and performance practices.

- Semantic HTML
- Dynamic page titles and metadata
- Use of ARIA
- Performance and Core Web Vitals
- Open Graph / social tags
- Include a Lighthouse report for the production build with scores:
  - Performance: ≥ 90
  - Best Practices: ≥ 90
  - Accessibility: ≥ 90

## Architecture and Code Quality

- Use React with TypeScript in strict mode.
- Implement client-side routing
- Data fetching
- Validate API responses at runtime and handle invalid data gracefully.
- Implement user-friendly error and empty states
- Cache store details data if a request is made for the same store within 5 minutes
- Do not expose API keys
- Use .env files
- Code should compile with zero TypeScript or ESLint errors.

## Testing

- Show examples of unit/integration tests and / or end-to-end tests.

## Performance and Deployment

- Run Lighthouse audit on production build and target >90 performance (desktop).
- Host on a public platform
- Include screenshot or JSON of Lighthouse scores

## Deliverables

- Publicly hosted app URL.
- GitHub repository or zipped project.

### README containing:

- Setup instructions and run commands.

## Evaluation

We will be looking for the following:

- React fundamentals and advanced concepts: custom hooks, routing, managing state, managing app performance
- TypeScript correctness and type safety.
- Code structure, readability, and maintainability.
- API integration, validation, and error handling.
- Accessibility and user experience quality
- Overall app performance and deployment setup.
- Testing coverage and approach.
- Design and adherence to branding.
