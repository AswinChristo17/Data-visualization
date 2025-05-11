# Data Visualization Dashboard

A modern, professional web application that transforms CSV data into beautiful, interactive visualizations. This dashboard is designed for businesses and data analysts who need to quickly visualize their data without complex setup.

## Features

- **CSV File Upload**: Easily upload your CSV data with drag-and-drop functionality
- **Multiple Chart Types**: Visualize your data with:
  - Bar charts
  - Line charts
  - Pie charts
  - Doughnut charts
  - Polar area charts
  - Radar charts
- **Interactive Controls**: Toggle between grid and full-width layouts
- **Dark Mode Support**: Switch between light and dark themes
- **Responsive Design**: Works on desktop and mobile devices
- **Download Options**: Export charts as PNG images
- **Expandable Charts**: Click to view charts in a larger modal window

## Getting Started

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- No server-side dependencies required

### Installation

1. Clone or download this repository
2. Open `index.html` in your web browser
3. That's it! No build process or installation required

### Using the Dashboard

1. **Upload Data**: Drag and drop a CSV file onto the upload area, or click to browse for a file
2. **View Visualizations**: Once uploaded, charts will automatically generate based on your data
3. **Interact with Charts**: 
   - Hover over data points to see detailed information
   - Use the controls at the top of each chart to download or expand
   - Toggle between grid and full-width layouts with the button at the top
4. **Change Theme**: Use the dark mode toggle in the header to switch between light and dark themes

## CSV Format Requirements

The dashboard works best with CSV files that have:

- A header row with column names
- A mix of categorical and numerical data
- Clean, consistent data formatting

Example CSV structure:

```
Category,Month,Sales,Profit,Customers,Items
Electronics,Jan,5843,1461,120,325
Clothing,Feb,4821,1205,185,241
Food,Mar,3612,722,271,217
```

A sample CSV file (`sample-data.csv`) is included in this repository for testing.

## How It Works

The dashboard automatically:

1. Parses your CSV data using PapaParse
2. Identifies categorical and numerical columns
3. Creates appropriate chart types based on your data structure
4. Applies consistent styling and color palettes
5. Handles responsive layout and interaction

## Customization

You can customize the dashboard by:

- Modifying `css/styles.css` to change colors, sizes, and layout
- Editing `js/script.js` to adjust chart creation logic and behaviors
- Updating `index.html` to add or remove chart containers

## Technologies Used

- **HTML5**: Structure and semantics
- **CSS3**: Styling and responsive design
- **JavaScript**: Client-side functionality
- **Chart.js**: Chart rendering
- **PapaParse**: CSV parsing

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Sample Data

A sample CSV file is included (`sample-data.csv`) with mock sales data that you can use to test the dashboard functionality. 