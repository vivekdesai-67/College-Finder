# Requirements Document

## Introduction

The Tech Boom Prediction feature is an AI-powered system that predicts which engineering branches will be in high demand (booming) in the upcoming year based on historical trends and current data. The system analyzes placement rates, salary trends, industry growth, and admission patterns to forecast cutoff changes and recommend branches to students.

## Glossary

- **Tech Boom**: A period of high demand and growth for a specific engineering branch
- **Cutoff Rank**: The minimum rank required for admission to a branch in a specific category
- **Boom Score**: A calculated metric (0-1) indicating the likelihood of a branch becoming highly competitive
- **Prediction Engine**: The algorithm that analyzes historical data and generates predictions
- **Current Year Data**: Actual cutoff and placement data from the database (2025)
- **Predicted Year Data**: AI-generated forecasts for the next year (2026)
- **Branch Trend**: Historical pattern of a branch's performance over time
- **Adjustment Factor**: Multiplier applied to current cutoffs based on boom prediction

## Requirements

### Requirement 1: Display Current Year Cutoffs

**User Story:** As a student, I want to view current year (2025) cutoff data for colleges and branches, so that I can understand my current eligibility.

#### Acceptance Criteria

1. WHEN a student accesses the predictions page THEN the System SHALL display actual cutoff data from the database for the current year
2. WHEN displaying current cutoffs THEN the System SHALL show all category-specific cutoffs (GM, 2AG, 3BG, etc.) for each branch
3. WHEN a student's rank and category match a cutoff THEN the System SHALL highlight eligible colleges with visual indicators
4. WHEN displaying college data THEN the System SHALL include placement rate, average salary, and infrastructure rating
5. WHEN current data is unavailable THEN the System SHALL display an appropriate message to the user

### Requirement 2: Generate Next Year Cutoff Predictions

**User Story:** As a student, I want to see predicted cutoffs for next year (2026), so that I can plan my college choices strategically.

#### Acceptance Criteria

1. WHEN the Prediction Engine analyzes branch data THEN the System SHALL calculate a boom score based on placement rate (30%), salary growth (30%), industry growth (25%), and admission trend (15%)
2. WHEN boom score exceeds 0.8 THEN the System SHALL classify the branch as "booming" and adjust predicted cutoffs by decreasing them by 15-25%
3. WHEN boom score is between 0.6 and 0.8 THEN the System SHALL classify the branch as "stable" and adjust predicted cutoffs by decreasing them by 5-10%
4. WHEN boom score is below 0.6 THEN the System SHALL classify the branch as "declining" and adjust predicted cutoffs by increasing them by 5-10%
5. WHEN generating predictions THEN the System SHALL apply adjustments to all category cutoffs proportionally

### Requirement 3: Display Predictions on Separate Page

**User Story:** As a student, I want to view predictions on a dedicated page with clear visualizations, so that I can easily understand future trends.

#### Acceptance Criteria

1. WHEN a student navigates to the predictions page THEN the System SHALL display a separate route at '/predictions'
2. WHEN the predictions page loads THEN the System SHALL show both current year and predicted year data side-by-side for comparison
3. WHEN displaying predictions THEN the System SHALL include visual indicators (🔥 for booming, 🟢 for stable, 🔵 for declining)
4. WHEN a branch is predicted to boom THEN the System SHALL display the reasoning (placement rate, salary growth, industry demand)
5. WHEN the page is accessed THEN the System SHALL be available to all authenticated students without requiring profile completion

### Requirement 4: Visualize Trends with Charts

**User Story:** As a student, I want to see graphical representations of branch trends, so that I can quickly identify patterns and opportunities.

#### Acceptance Criteria

1. WHEN displaying branch data THEN the System SHALL render line charts showing placement rate trends
2. WHEN displaying salary data THEN the System SHALL render bar charts comparing current vs predicted average salaries
3. WHEN showing multiple branches THEN the System SHALL provide comparison charts with color-coded lines for each branch
4. WHEN a chart is displayed THEN the System SHALL include axis labels, legends, and tooltips for data points
5. WHEN chart data is unavailable THEN the System SHALL display a fallback message without breaking the page layout

### Requirement 5: Filter and Search Predictions

**User Story:** As a student, I want to filter predictions by branch and college, so that I can focus on my areas of interest.

#### Acceptance Criteria

1. WHEN the predictions page loads THEN the System SHALL provide dropdown filters for branch selection
2. WHEN a student selects a branch filter THEN the System SHALL display only colleges offering that branch
3. WHEN a student selects "All Branches" THEN the System SHALL display predictions for all available branches
4. WHEN a student has preferred branches in their profile THEN the System SHALL highlight those branches by default
5. WHEN filters are applied THEN the System SHALL update the display within 500 milliseconds

### Requirement 6: College-Specific Predictions

**User Story:** As a student, I want to see predictions for specific colleges, so that I can compare institutions directly.

#### Acceptance Criteria

1. WHEN generating predictions THEN the System SHALL calculate boom scores for each college's branch individually
2. WHEN displaying college predictions THEN the System SHALL show the college name, location, and type
3. WHEN comparing colleges THEN the System SHALL rank them by predicted competitiveness for the student's category
4. WHEN a college has multiple branches THEN the System SHALL display predictions for all branches offered
5. WHEN college data is incomplete THEN the System SHALL use default values and indicate estimated data

### Requirement 7: Prediction Confidence and Reasoning

**User Story:** As a student, I want to understand why a branch is predicted to boom, so that I can make informed decisions.

#### Acceptance Criteria

1. WHEN displaying a prediction THEN the System SHALL show the boom score as a percentage (0-100%)
2. WHEN a branch is classified as booming THEN the System SHALL display specific metrics (placement rate increase, salary growth percentage)
3. WHEN showing reasoning THEN the System SHALL list the top 3 contributing factors in order of impact
4. WHEN predictions are uncertain THEN the System SHALL display a confidence level (high, medium, low)
5. WHEN historical data is limited THEN the System SHALL indicate that predictions are based on current trends only

### Requirement 8: Responsive Design and Accessibility

**User Story:** As a student using mobile devices, I want the predictions page to work seamlessly on all screen sizes, so that I can access predictions anywhere.

#### Acceptance Criteria

1. WHEN accessing the predictions page on mobile THEN the System SHALL display a responsive layout optimized for small screens
2. WHEN viewing side-by-side comparisons on mobile THEN the System SHALL stack current and predicted data vertically
3. WHEN charts are displayed on mobile THEN the System SHALL render them with appropriate scaling and touch interactions
4. WHEN using keyboard navigation THEN the System SHALL allow full access to all filters and data
5. WHEN screen readers are used THEN the System SHALL provide descriptive labels for all visual elements

### Requirement 9: Navigation and Integration

**User Story:** As a student, I want easy access to the predictions feature from the main dashboard, so that I can quickly check future trends.

#### Acceptance Criteria

1. WHEN a student is on the dashboard THEN the System SHALL display a "View 2026 Predictions" button or link
2. WHEN the predictions link is clicked THEN the System SHALL navigate to the predictions page without page reload
3. WHEN on the predictions page THEN the System SHALL provide a back button to return to the dashboard
4. WHEN the navbar is displayed THEN the System SHALL include a "Predictions" menu item for all authenticated users
5. WHEN a student is not authenticated THEN the System SHALL redirect to the login page when accessing predictions

### Requirement 10: Performance and Caching

**User Story:** As a student, I want predictions to load quickly, so that I don't waste time waiting for data.

#### Acceptance Criteria

1. WHEN predictions are calculated THEN the System SHALL complete the calculation within 2 seconds for up to 100 colleges
2. WHEN the same predictions are requested multiple times THEN the System SHALL cache results for 24 hours
3. WHEN new college data is added THEN the System SHALL invalidate the prediction cache automatically
4. WHEN the predictions page loads THEN the System SHALL show a loading indicator during data fetching
5. WHEN network errors occur THEN the System SHALL display an error message with a retry option
