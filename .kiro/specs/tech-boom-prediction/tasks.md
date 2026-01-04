# Implementation Plan: Tech Boom Prediction Feature

- [ ] 1. Create prediction engine core logic
  - [x] 1.1 Implement boom score calculation algorithm
    - Create `lib/prediction.ts` file with TypeScript interfaces
    - Implement `calculateBoomScore()` function with weighted metrics (placement 30%, salary 30%, industry 25%, admission 15%)
    - _Requirements: 2.1_
  
  - [x] 1.2 Implement cutoff adjustment logic
    - Create `predictCutoffAdjustment()` function that maps boom scores to adjustment factors
    - Handle booming (>0.8 = 15-25% decrease), stable (0.6-0.8 = 5-10% decrease), declining (<0.6 = 5-10% increase)
    - _Requirements: 2.2, 2.3, 2.4_
  
  - [x] 1.3 Implement branch prediction generation
    - Create `generateBranchPrediction()` function that combines boom score with cutoff adjustments
    - Apply adjustments proportionally to all category cutoffs
    - Generate reasoning strings based on contributing factors
    - _Requirements: 2.5, 7.2, 7.3_
  
  - [x] 1.4 Implement college-level prediction aggregation
    - Create `generateCollegePredictions()` function that processes all colleges
    - Calculate overall boom scores for colleges based on branch predictions
    - Handle missing data with default values
    - _Requirements: 6.1, 6.2, 6.5_

- [ ] 2. Create predictions API endpoint
  - [x] 2.1 Implement GET /api/predictions route
    - Create `app/api/predictions/route.ts` file
    - Fetch college data from MongoDB
    - Call prediction engine to generate predictions
    - Return structured JSON response with current and predicted data
    - _Requirements: 1.1, 2.1, 3.2_
  
  - [x] 2.2 Add query parameter support for filtering
    - Parse category, rank, and branches query parameters
    - Filter predictions based on student profile
    - Implement `filterByStudentProfile()` function in prediction engine
    - _Requirements: 5.1, 5.2, 5.3, 5.4_
  
  - [x] 2.3 Implement trending summary calculation
    - Identify top 5 booming branches across all colleges
    - Identify top 5 declining branches
    - Calculate average cutoff change percentage
    - _Requirements: 7.1, 7.2_
  
  - [x] 2.4 Add error handling and validation
    - Validate query parameters
    - Handle database connection errors
    - Return appropriate error messages
    - _Requirements: 1.5, 10.5_

- [ ] 3. Build predictions page UI
  - [x] 3.1 Create main predictions page component
    - Create `app/predictions/page.tsx` file
    - Implement authentication check and redirect logic
    - Fetch student profile data
    - Fetch predictions from API endpoint
    - Display loading indicator during data fetch
    - _Requirements: 3.1, 3.5, 9.5, 10.4_
  
  - [x] 3.2 Implement page header and student profile summary
    - Display page title "Tech Boom Predictions 2026"
    - Show student rank, category, and preferred branches
    - Add description explaining the feature
    - _Requirements: 3.1, 7.4_
  
  - [x] 3.3 Create filter controls
    - Implement branch dropdown filter
    - Implement "All Branches" option
    - Highlight preferred branches from student profile
    - Update display when filters change (within 500ms)
    - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5_
  
  - [x] 3.4 Implement side-by-side comparison layout
    - Create two-column layout for current vs predicted data
    - Make layout responsive (stack vertically on mobile)
    - Add visual separators between columns
    - _Requirements: 3.2, 8.1, 8.2_

- [ ] 4. Create prediction card component
  - [x] 4.1 Build PredictionCard component
    - Create `components/PredictionCard.tsx` file
    - Display college name, location, type, fees, infrastructure rating
    - Show current year cutoffs for all categories
    - Show predicted year cutoffs for all categories
    - Highlight eligible colleges based on student rank and category
    - _Requirements: 1.2, 1.3, 1.4, 6.2, 6.3_
  
  - [x] 4.2 Add boom status indicators
    - Display visual indicators (🔥 booming, 🟢 stable, 🔵 declining)
    - Show boom score as percentage
    - Display boom status classification
    - _Requirements: 3.3, 7.1_
  
  - [x] 4.3 Implement metrics comparison display
    - Show placement rate (current and predicted)
    - Show average salary (current and predicted)
    - Display percentage changes with color coding
    - _Requirements: 1.4, 7.2_
  
  - [x] 4.4 Add reasoning and confidence display
    - List top 3 contributing factors for boom prediction
    - Display confidence level (high, medium, low)
    - Show explanatory text for predictions
    - _Requirements: 3.4, 7.3, 7.4, 7.5_

- [ ] 5. Create chart visualization components
  - [x] 5.1 Set up charting library
    - Install recharts or chart.js library
    - Create base chart wrapper component
    - _Requirements: 4.1, 4.2, 4.3_
  
  - [x] 5.2 Build TrendChart component
    - Create `components/TrendChart.tsx` file
    - Implement line chart for placement rate trends
    - Implement bar chart for salary comparisons
    - Add axis labels, legends, and tooltips
    - _Requirements: 4.1, 4.2, 4.4_
  
  - [x] 5.3 Implement multi-branch comparison chart
    - Create comparison chart with color-coded lines for each branch
    - Support filtering to show selected branches only
    - _Requirements: 4.3_
  
  - [x] 5.4 Add responsive chart behavior
    - Scale charts appropriately for mobile screens
    - Enable touch interactions for mobile devices
    - Display fallback message when data is unavailable
    - _Requirements: 4.5, 8.3_

- [ ] 6. Add navigation and integration
  - [x] 6.1 Update Navbar component
    - Add "Predictions" menu item to navbar
    - Show menu item only for authenticated users
    - Link to /predictions route
    - _Requirements: 9.4_
  
  - [x] 6.2 Add predictions link to dashboard
    - Update dashboard page to include "View 2026 Predictions" button
    - Style button prominently
    - Navigate to predictions page on click
    - _Requirements: 9.1, 9.2_
  
  - [x] 6.3 Implement back navigation
    - Add back button on predictions page
    - Navigate to previous page or dashboard
    - _Requirements: 9.3_

- [ ] 7. Implement accessibility features
  - [x] 7.1 Add keyboard navigation support
    - Ensure all filters are keyboard accessible
    - Add proper tab order for interactive elements
    - _Requirements: 8.4_
  
  - [x] 7.2 Add screen reader support
    - Add ARIA labels to all visual elements
    - Provide descriptive text for boom indicators
    - Add alt text for charts
    - _Requirements: 8.5_
  
  - [x] 7.3 Ensure color contrast compliance
    - Verify all text meets WCAG AA standards
    - Use patterns in addition to colors for status indicators
    - _Requirements: 8.5_

- [ ] 8. Optimize performance and add caching
  - [x] 8.1 Implement prediction caching
    - Add in-memory cache for prediction results
    - Set cache expiration to 24 hours
    - Implement cache key generation based on query parameters
    - _Requirements: 10.2_
  
  - [x] 8.2 Add cache invalidation logic
    - Invalidate cache when new college data is added
    - Provide manual cache refresh option for admins
    - _Requirements: 10.3_
  
  - [x] 8.3 Optimize prediction calculation performance
    - Ensure calculations complete within 2 seconds for 100 colleges
    - Use efficient algorithms for boom score calculation
    - Batch database queries where possible
    - _Requirements: 10.1_

- [ ] 9. Final testing and polish
  - [x] 9.1 Test with real college data
    - Verify predictions are reasonable and logical
    - Check that all categories are handled correctly
    - Test with various student profiles (different ranks and categories)
    - _Requirements: All_
  
  - [x] 9.2 Test responsive design
    - Verify layout on mobile, tablet, and desktop
    - Test touch interactions on mobile devices
    - Ensure charts render correctly on all screen sizes
    - _Requirements: 8.1, 8.2, 8.3_
  
  - [x] 9.3 Test error scenarios
    - Test with missing college data
    - Test with network errors
    - Verify error messages are user-friendly
    - Test retry functionality
    - _Requirements: 1.5, 4.5, 10.5_
  
  - [x] 9.4 Performance testing
    - Measure page load time
    - Verify prediction calculation time
    - Test with large datasets (100+ colleges)
    - _Requirements: 10.1, 10.4_

- [ ] 10. Final checkpoint
  - Ensure all tests pass, ask the user if questions arise.
