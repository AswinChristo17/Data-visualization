document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const themeSwitch = document.getElementById('theme-switch');
    const uploadArea = document.getElementById('upload-area');
    const fileInput = document.getElementById('csv-file');
    const fileInfo = document.getElementById('file-info');
    const visualizationsSection = document.getElementById('visualizations-section');
    const dashboardGrid = document.getElementById('dashboard-grid');
    const downloadAllBtn = document.getElementById('download-all');
    const toggleGridBtn = document.getElementById('toggle-grid');
    const chartModal = document.getElementById('chart-modal');
    const welcomeModal = document.getElementById('welcome-modal');
    const modalBackdrop = document.getElementById('modal-backdrop');
    const closeModalBtn = document.getElementById('close-modal');
    const closeWelcomeModalBtn = document.getElementById('close-welcome-modal');
    const startWelcomeTourBtn = document.getElementById('start-welcome-tour');
    const skipWelcomeTourBtn = document.getElementById('skip-welcome-tour');
    const modalTitle = document.getElementById('modal-title');
    const modalChart = document.getElementById('modal-chart');
    const generateInsightsBtn = document.getElementById('generate-insights');
    const refreshInsightsBtn = document.getElementById('refresh-insights');
    const insightsContainer = document.getElementById('insights-container');
    const startTourBtn = document.getElementById('start-tour');
    const floatingHelpBtn = document.getElementById('floating-help');
    
    // Chart instances
    let charts = {};
    
    // Current data
    let currentData = null;
    let currentColumns = null;
    
    // Theme handling
    const initTheme = () => {
        const savedTheme = localStorage.getItem('theme') || 'light';
        document.documentElement.setAttribute('data-theme', savedTheme);
        themeSwitch.checked = savedTheme === 'dark';
    };

    themeSwitch.addEventListener('change', () => {
        const newTheme = themeSwitch.checked ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        localStorage.setItem('theme', newTheme);
        
        // Update charts if they exist
        for (const chartType in charts) {
            if (charts[chartType]) {
                updateChartColors(charts[chartType]);
            }
        }
    });

    // Welcome and tour handling
    function showWelcomeModal() {
        welcomeModal.style.display = 'block';
        modalBackdrop.style.display = 'block';
    }
    
    function closeWelcomeModal() {
        welcomeModal.style.display = 'none';
        modalBackdrop.style.display = 'none';
    }
    
    function startTour() {
        closeWelcomeModal();
        const tour = new DashboardTour();
        tour.start();
    }
    
    // Attach welcome and tour event listeners
    closeWelcomeModalBtn.addEventListener('click', closeWelcomeModal);
    startWelcomeTourBtn.addEventListener('click', startTour);
    skipWelcomeTourBtn.addEventListener('click', closeWelcomeModal);
    startTourBtn.addEventListener('click', startTour);
    floatingHelpBtn.addEventListener('click', () => {
        // Start the tour when the floating help button is clicked
        const tour = new DashboardTour();
        tour.start();
        
        // Add a subtle animation when clicked
        floatingHelpBtn.classList.add('clicked');
        setTimeout(() => {
            floatingHelpBtn.classList.remove('clicked');
        }, 300);
    });
    
    // Show welcome modal on first visit
    if (!localStorage.getItem('has_seen_dashboard')) {
        showWelcomeModal();
        localStorage.setItem('has_seen_dashboard', 'true');
    }

    function loadTemplateData(templateType) {
        // Show loading indicator in the file info area
        fileInfo.innerHTML = `<p class="file-upload-success">Loading ${templateType} template...</p>`;
        
        try {
            // Each template type will have slightly different data to demonstrate different visualizations
            let sampleData;
            
            switch(templateType) {
                case 'sales':
                    // Sales template emphasizes monthly performance and product categories
                    sampleData = generateTemplateCSV('sales', 
                        ['Electronics', 'Clothing', 'Home', 'Sports', 'Beauty'],
                        ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                        {
                            salesMultiplier: 1.5,  // Higher sales numbers
                            profitMargin: 0.25,    // Good profit margin
                            seasonality: true      // Shows seasonal patterns
                        }
                    );
                    break;
                    
                case 'marketing':
                    // Marketing template focuses on campaigns and channels
                    sampleData = generateTemplateCSV('marketing',
                        ['Social Media', 'Email', 'Search', 'Display', 'Affiliate'],
                        ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                        {
                            conversionEmphasis: true,  // Focus on conversion metrics
                            channelVariance: true      // Shows differences between channels
                        }
                    );
                    break;
                    
                case 'financial':
                    // Financial template emphasizes revenue, expenses, and profit
                    sampleData = generateTemplateCSV('financial',
                        ['Revenue', 'Expenses', 'Profit', 'Assets', 'Liabilities'],
                        ['Q1', 'Q2', 'Q3', 'Q4'],
                        {
                            quarterlyData: true,    // Quarterly instead of monthly
                            financialMetrics: true  // Includes financial ratios
                        }
                    );
                    break;
                    
                case 'hr':
                    // HR template focuses on employee metrics
                    sampleData = generateTemplateCSV('hr',
                        ['Engineering', 'Sales', 'Marketing', 'Support', 'Operations'],
                        ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                        {
                            employeeMetrics: true,  // Focus on employee-specific metrics
                            departmentComparison: true
                        }
                    );
                    break;
                    
                case 'inventory':
                    // Inventory template focuses on stock levels and turnover
                    sampleData = generateTemplateCSV('inventory',
                        ['Raw Materials', 'Work in Progress', 'Finished Goods', 'Packaging', 'Supplies'],
                        ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                        {
                            inventoryMetrics: true,  // Focus on inventory-specific metrics
                            stockLevels: true        // Emphasize stock level changes
                        }
                    );
                    break;
                    
                default:
                    // Default template - general sales data
                    sampleData = generateSampleCSV();
            }
            
            // Parse the template data with more robust options
            parseCSVData(sampleData, true, templateType);
        } catch (error) {
            console.error("Error loading template:", error);
            fileInfo.innerHTML = `<p class="file-upload-error">Error loading template: ${error.message}</p>`;
        }
    }

    function handleFileUpload(file) {
        if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
            fileInfo.innerHTML = `<p class="file-upload-error">Error: Please upload a CSV file</p>`;
            return;
        }

        fileInfo.innerHTML = `<p class="file-upload-success">File selected: ${file.name}</p>`;
        
        // Read the file content
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const fileContent = e.target.result;
                parseCSVData(fileContent, false);
            } catch (error) {
                console.error("Error reading CSV:", error);
                fileInfo.innerHTML = `<p class="file-upload-error">Error reading CSV: ${error.message}</p>`;
            }
        };
        
        reader.onerror = function() {
            fileInfo.innerHTML = `<p class="file-upload-error">Error reading file</p>`;
        };
        
        reader.readAsText(file);
    }

    function parseCSVData(csvContent, isTemplate = false) {
        // First, try to automatically detect the delimiter
        const possibleDelimiters = [',', ';', '\t', '|'];
        let bestDelimiter = ',';
        let maxFields = 0;
        
        // Before parsing, destroy any existing charts to prevent conflicts
        Object.keys(charts).forEach(chartType => {
            if (charts[chartType]) {
                charts[chartType].destroy();
                charts[chartType] = null;
            }
        });
        
        // Test a sample of the first few lines with different delimiters
        const sampleLines = csvContent.split('\n').slice(0, 5).join('\n');
        
        for (const delimiter of possibleDelimiters) {
            try {
                const result = Papa.parse(sampleLines, {
                    delimiter: delimiter,
                    preview: 5,
                    header: true
                });
                
                // Count fields in the parsed result
                if (result.meta.fields.length > maxFields) {
                    maxFields = result.meta.fields.length;
                    bestDelimiter = delimiter;
                }
            } catch (e) {
                console.log(`Error with delimiter ${delimiter}:`, e);
            }
        }
        
        // Now parse with the best delimiter
        Papa.parse(csvContent, {
            header: true,
            dynamicTyping: true,
            delimiter: bestDelimiter,
            skipEmptyLines: true,
            transformHeader: function(header) {
                // Clean up header names (remove quotes, extra spaces)
                return header.trim().replace(/^["'](.*)["']$/, '$1');
            },
            complete: (results) => {
                if (results.errors.length) {
                    // Try to handle common errors
                    if (results.errors.some(e => e.code === "TooFewFields" || e.code === "TooManyFields")) {
                        // If inconsistent fields, try with a different strategy - no headers
                        handleInconsistentCSV(csvContent);
                        return;
                    }
                    
                    console.error("CSV parsing errors:", results.errors);
                    fileInfo.innerHTML = `<p class="file-upload-error">Error parsing CSV: ${results.errors[0].message}</p>`;
                    return;
                }
                
                const data = results.data;
                
                // Remove any empty rows (often found at the end of CSV files)
                const cleanData = data.filter(row => {
                    return Object.values(row).some(value => value !== null && value !== '' && value !== undefined);
                });
                
                if (cleanData.length === 0) {
                    fileInfo.innerHTML = `<p class="file-upload-error">Error: CSV file contains no data</p>`;
                    return;
                }
                
                // Process and visualize the data
                processData(cleanData, results.meta.fields);
                
                fileInfo.innerHTML = `<p class="file-upload-success">CSV File Successfully Parsed</p>`;
            }
        });
    }

    function handleInconsistentCSV(csvContent) {
        // Analyze the CSV to determine the structure
        const lines = csvContent.split('\n').filter(line => line.trim() !== '');
        
        if (lines.length < 2) {
            fileInfo.innerHTML = `<p class="file-upload-error">Error: CSV file is too small or empty</p>`;
            return;
        }
        
        // Check if we need to generate headers
        Papa.parse(csvContent, {
            delimiter: autoDetectDelimiter(csvContent),
            skipEmptyLines: true,
            complete: (results) => {
                if (results.data.length < 2) {
                    fileInfo.innerHTML = `<p class="file-upload-error">Error: Not enough data in CSV file</p>`;
                    return;
                }
                
                const firstRow = results.data[0];
                const secondRow = results.data[1];
                
                // Check if first row might be headers (different data types than second row)
                let firstRowLikelyHeaders = true;
                for (let i = 0; i < Math.min(firstRow.length, secondRow.length); i++) {
                    const firstItemIsNumeric = !isNaN(Number(firstRow[i]));
                    const secondItemIsNumeric = !isNaN(Number(secondRow[i]));
                    
                    if (firstItemIsNumeric === secondItemIsNumeric) {
                        firstRowLikelyHeaders = false;
                        break;
                    }
                }
                
                // Re-parse with appropriate header setting
                Papa.parse(csvContent, {
                    header: firstRowLikelyHeaders,
                    dynamicTyping: true,
                    skipEmptyLines: true,
                    delimiter: autoDetectDelimiter(csvContent),
                    complete: (finalResults) => {
                        let cleanData = finalResults.data;
                        let fields;
                        
                        if (!firstRowLikelyHeaders) {
                            // Generate column names like Column1, Column2, etc.
                            fields = Array.from({ length: cleanData[0].length }, (_, i) => `Column${i + 1}`);
                            
                            // Convert array data to object data with our generated headers
                            cleanData = cleanData.map(row => {
                                const obj = {};
                                row.forEach((value, i) => {
                                    if (i < fields.length) {
                                        obj[fields[i]] = value;
                                    }
                                });
                                return obj;
                            });
                        } else {
                            fields = finalResults.meta.fields || [];
                        }
                        
                        // Filter out empty rows
                        cleanData = cleanData.filter(row => {
                            if (Array.isArray(row)) {
                                return row.some(val => val !== null && val !== '');
                            } else {
                                return Object.values(row).some(val => val !== null && val !== '');
                            }
                        });
                        
                        if (cleanData.length === 0) {
                            fileInfo.innerHTML = `<p class="file-upload-error">Error: No valid data found in CSV</p>`;
                            return;
                        }
                        
                        processData(cleanData, fields);
                        
                        // Show info that we've fixed the CSV
                        fileInfo.innerHTML = `<p class="file-upload-success">CSV file processed. <span class="auto-tag">Auto-fixed</span></p>`;
                    }
                });
            }
        });
    }

    function autoDetectDelimiter(csvContent) {
        // Get a sample of the first few lines
        const sampleLines = csvContent.split('\n').slice(0, 5).join('\n');
        
        // Count occurrences of different delimiters
        const delimiters = {
            ',': (sampleLines.match(/,/g) || []).length,
            ';': (sampleLines.match(/;/g) || []).length,
            '\t': (sampleLines.match(/\t/g) || []).length,
            '|': (sampleLines.match(/\|/g) || []).length
        };
        
        // Find the delimiter with the most occurrences
        let bestDelimiter = ',';
        let maxCount = 0;
        
        for (const [delimiter, count] of Object.entries(delimiters)) {
            if (count > maxCount) {
                maxCount = count;
                bestDelimiter = delimiter;
            }
        }
        
        return bestDelimiter;
    }

    // Generate template-specific CSV data
    function generateTemplateCSV(templateType, categories, timePeriods, options = {}) {
        let header;
        let rows = [];
        
        switch(templateType) {
            case 'sales':
                header = 'Category,Month,Sales,Profit,Customers,Items\n';
                
                for (const category of categories) {
                    for (const month of timePeriods) {
                        const baseValue = 1000 + Math.random() * 9000;
                        // Apply seasonality if enabled
                        const seasonalFactor = options.seasonality ? getSeasonalFactor(month) : 1;
                        const sales = Math.floor(baseValue * seasonalFactor * options.salesMultiplier);
                        const profit = Math.floor(sales * options.profitMargin);
                        const customers = Math.floor(sales / (50 + Math.random() * 30));
                        const items = Math.floor(sales / (15 + Math.random() * 10));
                        
                        rows.push(`${category},${month},${sales},${profit},${customers},${items}`);
                    }
                }
                break;
                
            case 'marketing':
                header = 'Channel,Month,Impressions,Clicks,Conversions,Cost,Revenue\n';
                
                for (const channel of categories) {
                    // Different channels have different performance
                    const channelFactor = options.channelVariance ? getChannelFactor(channel) : 1;
                    
                    for (const month of timePeriods) {
                        const impressions = Math.floor((10000 + Math.random() * 90000) * channelFactor);
                        const ctr = (0.5 + Math.random() * 4.5) * channelFactor / 100; // Click-through rate
                        const clicks = Math.floor(impressions * ctr);
                        const convRate = (0.5 + Math.random() * 9.5) * channelFactor / 100; // Conversion rate
                        const conversions = Math.floor(clicks * convRate);
                        const costPerClick = 0.5 + Math.random() * 2;
                        const cost = Math.floor(clicks * costPerClick);
                        const avgOrderValue = 50 + Math.random() * 150;
                        const revenue = Math.floor(conversions * avgOrderValue);
                        
                        rows.push(`${channel},${month},${impressions},${clicks},${conversions},${cost},${revenue}`);
                    }
                }
                break;
                
            case 'financial':
                header = 'Category,Period,Revenue,Expenses,Profit,GrowthRate\n';
                
                // Using financial categories
                const financialCategories = ['Product Sales', 'Services', 'Licensing', 'Subscription', 'Other'];
                
                for (const category of financialCategories) {
                    let prevRevenue = 0;
                    for (const period of timePeriods) {
                        const revenue = Math.floor(100000 + Math.random() * 900000);
                        const expenses = Math.floor(revenue * (0.4 + Math.random() * 0.3));
                        const profit = revenue - expenses;
                        
                        // Calculate growth rate if we have previous revenue
                        let growthRate = 0;
                        if (prevRevenue > 0) {
                            growthRate = ((revenue - prevRevenue) / prevRevenue) * 100;
                        }
                        
                        rows.push(`${category},${period},${revenue},${expenses},${profit},${growthRate.toFixed(2)}`);
                        prevRevenue = revenue;
                    }
                }
                break;
                
            case 'hr':
                header = 'Department,Month,Headcount,NewHires,Turnover,Satisfaction,Performance\n';
                
                for (const department of categories) {
                    let headcount = 10 + Math.floor(Math.random() * 90); // Starting headcount
                    
                    for (const month of timePeriods) {
                        const newHires = Math.floor(Math.random() * 10);
                        const turnover = Math.floor(Math.random() * 5);
                        headcount = headcount + newHires - turnover;
                        const satisfaction = Math.floor(60 + Math.random() * 40); // 0-100 scale
                        const performance = Math.floor(70 + Math.random() * 30); // 0-100 scale
                        
                        rows.push(`${department},${month},${headcount},${newHires},${turnover},${satisfaction},${performance}`);
                    }
                }
                break;
                
            case 'inventory':
                header = 'ItemType,Month,StockLevel,Reorders,Turnover,HoldingCost,StockValue\n';
                
                for (const itemType of categories) {
                    let stockLevel = 200 + Math.floor(Math.random() * 800); // Starting stock
                    
                    for (const month of timePeriods) {
                        const consumption = Math.floor(stockLevel * (0.3 + Math.random() * 0.4)); // 30-70% turnover
                        const reorders = Math.floor(consumption * (0.8 + Math.random() * 0.4)); // Reorder 80-120% of consumption
                        stockLevel = stockLevel - consumption + reorders;
                        const unitCost = 10 + Math.random() * 90;
                        const holdingCost = Math.floor(stockLevel * unitCost * 0.02); // 2% holding cost
                        const stockValue = Math.floor(stockLevel * unitCost);
                        
                        rows.push(`${itemType},${month},${stockLevel},${reorders},${consumption},${holdingCost},${stockValue}`);
                    }
                }
                break;
                
            default:
                return generateSampleCSV();
        }
        
        return header + rows.join('\n');
    }

    // Helper function for seasonal factors
    function getSeasonalFactor(month) {
        const seasons = {
            'Jan': 0.7, 'Feb': 0.8, 'Mar': 0.9, 'Apr': 1.0,
            'May': 1.1, 'Jun': 1.2, 'Jul': 1.3, 'Aug': 1.2,
            'Sep': 1.1, 'Oct': 1.0, 'Nov': 1.2, 'Dec': 1.5
        };
        
        return seasons[month] || 1;
    }

    // Helper function for channel performance factors
    function getChannelFactor(channel) {
        const factors = {
            'Social Media': 1.2,
            'Email': 1.5,
            'Search': 1.3,
            'Display': 0.8,
            'Affiliate': 1.0
        };
        
        return factors[channel] || 1;
    }

    function processData(data, columns) {
        // Save the current data for insights generation
        currentData = data;
        currentColumns = columns;
        
        // Show visualizations section
        visualizationsSection.classList.add('active');
        
        // Clear any existing charts
        Object.keys(charts).forEach(chartType => {
            if (charts[chartType]) {
                charts[chartType].destroy();
                charts[chartType] = null;
            }
        });
        
        // Create charts based on the data
        createCharts(data, columns);
        
        // Generate insights automatically
        generateInsights();
    }
    
    // Insights generation
    function generateInsights() {
        if (!currentData || !currentColumns) return;
        
        // Clear existing insights
        insightsContainer.innerHTML = '';
        
        // Show loading state
        insightsContainer.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
            </div>
        `;
        
        // Create insights generator
        setTimeout(() => {
            const insightsGenerator = new InsightsGenerator(currentData, currentColumns);
            const insights = insightsGenerator.generateAllInsights();
            
            displayInsights(insights);
        }, 500); // Small delay for visual feedback
    }
    
    function displayInsights(insights) {
        // Clear loading state
        insightsContainer.innerHTML = '';
        
        if (insights.length === 0) {
            insightsContainer.innerHTML = `
                <div class="no-insights">
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="12" cy="12" r="10"></circle>
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                    </svg>
                    <p>No insights could be generated from this data</p>
                </div>
            `;
            return;
        }
        
        // Sort insights by importance
        insights.sort((a, b) => {
            if (a.importance === 'primary' && b.importance !== 'primary') return -1;
            if (a.importance !== 'primary' && b.importance === 'primary') return 1;
            return 0;
        });
        
        // Display insights
        insights.forEach(insight => {
            const insightClass = insight.class || 'info';
            
            const insightEl = document.createElement('div');
            insightEl.className = `insight-card ${insightClass}`;
            insightEl.innerHTML = `
                <div class="insight-title">${insight.title}</div>
                <div class="insight-value">${insight.value}</div>
                <div class="insight-description">${insight.description}</div>
            `;
            
            insightsContainer.appendChild(insightEl);
        });
    }

    function createCharts(data, columns) {
        // Find numeric and categorical columns for different chart types
        const numericColumns = columns.filter(column => 
            data.some(row => typeof row[column] === 'number')
        );
        
        const categoricalColumns = columns.filter(column => 
            !numericColumns.includes(column) && 
            data.some(row => row[column] !== null && row[column] !== '')
        );
        
        // Create Bar Chart
        if (numericColumns.length > 0) {
            createBarChart(data, categoricalColumns[0] || columns[0], numericColumns[0]);
        }
        
        // Create Line Chart
        if (numericColumns.length > 0) {
            createLineChart(data, columns[0], numericColumns[0]);
        }
        
        // Create Pie Chart
        if (categoricalColumns.length > 0 && numericColumns.length > 0) {
            createPieChart(data, categoricalColumns[0], numericColumns[0]);
        }
        
        // Create Doughnut Chart
        if (categoricalColumns.length > 0 && numericColumns.length > 0) {
            createDoughnutChart(data, categoricalColumns[0], numericColumns[0]);
        }
        
        // Create Polar Area Chart
        if (categoricalColumns.length > 0 && numericColumns.length > 0) {
            createPolarChart(data, categoricalColumns[0], numericColumns[0]);
        }
        
        // Create Radar Chart
        if (numericColumns.length >= 3) {
            createRadarChart(data, categoricalColumns[0] || columns[0], numericColumns.slice(0, 5));
        }
    }

    // Color management
    function getChartColors(count = 10) {
        const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
        
        // Base colors for light and dark modes
        const lightColors = [
            '#4361ee', '#3a0ca3', '#7209b7', '#f72585', '#4cc9f0', 
            '#fb8500', '#ffb703', '#023e8a', '#0077b6', '#0096c7'
        ];
        
        const darkColors = [
            '#4cc9f0', '#4895ef', '#4361ee', '#3f37c9', '#3a0ca3', 
            '#f72585', '#b5179e', '#7209b7', '#560bad', '#480ca8'
        ];
        
        const colors = isDarkMode ? darkColors : lightColors;
        
        // If we need more colors than our base set, generate additional ones
        if (count > colors.length) {
            const additionalColors = [];
            for (let i = 0; i < count - colors.length; i++) {
                const hue = Math.floor(Math.random() * 360);
                const saturation = Math.floor(50 + Math.random() * 30);
                const lightness = isDarkMode 
                    ? Math.floor(50 + Math.random() * 30)
                    : Math.floor(30 + Math.random() * 30);
                    
                additionalColors.push(`hsl(${hue}, ${saturation}%, ${lightness}%)`);
            }
            return [...colors, ...additionalColors];
        }
        
        return colors.slice(0, count);
    }

    function updateChartColors(chart) {
        if (!chart) return;
        
        const isDarkMode = document.documentElement.getAttribute('data-theme') === 'dark';
        const gridColor = isDarkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)';
        const textColor = isDarkMode ? '#e0e0e0' : '#333333';
        
        // Update chart configuration based on its type
        if (chart.config.type === 'line' || chart.config.type === 'bar') {
            if (chart.options.scales && chart.options.scales.x) {
                chart.options.scales.x.grid.color = gridColor;
                chart.options.scales.x.ticks.color = textColor;
            }
            if (chart.options.scales && chart.options.scales.y) {
                chart.options.scales.y.grid.color = gridColor;
                chart.options.scales.y.ticks.color = textColor;
            }
        }
        
        // Update legend text color
        if (chart.options.plugins && chart.options.plugins.legend) {
            chart.options.plugins.legend.labels.color = textColor;
        }
        
        // For pie, doughnut, and polarArea charts, update colors if needed
        if (['pie', 'doughnut', 'polarArea'].includes(chart.config.type) && chart.data.datasets && chart.data.datasets.length > 0) {
            chart.data.datasets[0].backgroundColor = getChartColors(chart.data.labels.length);
        }
        
        chart.update();
    }

    // Chart creation functions
    function createBarChart(data, labelColumn, valueColumn) {
        const chartLabels = data.map(row => row[labelColumn]);
        const chartValues = data.map(row => row[valueColumn]);
        
        const ctx = document.getElementById('bar-chart').getContext('2d');
        charts.bar = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: chartLabels,
                datasets: [{
                    label: valueColumn,
                    data: chartValues,
                    backgroundColor: getChartColors(1)[0],
                    borderColor: getChartColors(1)[0],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.7)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        titleFont: {
                            size: 14,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 14
                        },
                        padding: 10,
                        cornerRadius: 5,
                        displayColors: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
        
        // Update colors based on current theme
        updateChartColors(charts.bar);
    }

    function createLineChart(data, labelColumn, valueColumn) {
        const chartLabels = data.map(row => row[labelColumn]);
        const chartValues = data.map(row => row[valueColumn]);
        
        const ctx = document.getElementById('line-chart').getContext('2d');
        charts.line = new Chart(ctx, {
            type: 'line',
            data: {
                labels: chartLabels,
                datasets: [{
                    label: valueColumn,
                    data: chartValues,
                    backgroundColor: getChartColors(1)[0] + '33', // Adding alpha for fill
                    borderColor: getChartColors(1)[0],
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4,
                    pointRadius: 4,
                    pointBackgroundColor: getChartColors(1)[0],
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top'
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
        
        // Update colors based on current theme
        updateChartColors(charts.line);
    }

    function createPieChart(data, labelColumn, valueColumn) {
        // Aggregate data by label (in case of duplicates)
        const aggregatedData = {};
        data.forEach(row => {
            const label = row[labelColumn];
            const value = row[valueColumn] || 0;
            
            if (aggregatedData[label]) {
                aggregatedData[label] += value;
            } else {
                aggregatedData[label] = value;
            }
        });
        
        const chartLabels = Object.keys(aggregatedData);
        const chartValues = Object.values(aggregatedData);
        
        const ctx = document.getElementById('pie-chart').getContext('2d');
        charts.pie = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: chartLabels,
                datasets: [{
                    data: chartValues,
                    backgroundColor: getChartColors(chartLabels.length),
                    borderColor: '#fff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        align: 'center',
                        labels: {
                            boxWidth: 15,
                            padding: 15,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    }
                }
            }
        });
        
        // Update colors based on current theme
        updateChartColors(charts.pie);
    }

    function createDoughnutChart(data, labelColumn, valueColumn) {
        // Aggregate data by label (in case of duplicates)
        const aggregatedData = {};
        data.forEach(row => {
            const label = row[labelColumn];
            const value = row[valueColumn] || 0;
            
            if (aggregatedData[label]) {
                aggregatedData[label] += value;
            } else {
                aggregatedData[label] = value;
            }
        });
        
        const chartLabels = Object.keys(aggregatedData);
        const chartValues = Object.values(aggregatedData);
        
        const ctx = document.getElementById('doughnut-chart').getContext('2d');
        charts.doughnut = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: chartLabels,
                datasets: [{
                    data: chartValues,
                    backgroundColor: getChartColors(chartLabels.length),
                    borderColor: '#fff',
                    borderWidth: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'right',
                        align: 'center',
                        labels: {
                            boxWidth: 15,
                            padding: 15,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    }
                }
            }
        });
        
        // Update colors based on current theme
        updateChartColors(charts.doughnut);
    }

    function createPolarChart(data, labelColumn, valueColumn) {
        // Aggregate data by label (in case of duplicates)
        const aggregatedData = {};
        data.forEach(row => {
            const label = row[labelColumn];
            const value = row[valueColumn] || 0;
            
            if (aggregatedData[label]) {
                aggregatedData[label] += value;
            } else {
                aggregatedData[label] = value;
            }
        });
        
        const chartLabels = Object.keys(aggregatedData);
        const chartValues = Object.values(aggregatedData);
        
        const ctx = document.getElementById('polar-chart').getContext('2d');
        charts.polar = new Chart(ctx, {
            type: 'polarArea',
            data: {
                labels: chartLabels,
                datasets: [{
                    data: chartValues,
                    backgroundColor: getChartColors(chartLabels.length).map(color => color + 'cc'),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        align: 'center',
                        labels: {
                            boxWidth: 15,
                            padding: 15,
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    }
                }
            }
        });
        
        // Update colors based on current theme
        updateChartColors(charts.polar);
    }

    function createRadarChart(data, labelColumn, valueColumns) {
        // Get unique labels
        const labels = [...new Set(data.map(row => row[labelColumn]))];
        
        // Generate datasets
        const datasets = valueColumns.map((column, index) => {
            const color = getChartColors(valueColumns.length)[index];
            return {
                label: column,
                data: labels.map(label => {
                    const matchingRow = data.find(row => row[labelColumn] === label);
                    return matchingRow ? matchingRow[column] : 0;
                }),
                borderColor: color,
                backgroundColor: color + '33',
                borderWidth: 2,
                pointRadius: 4,
                pointBackgroundColor: color,
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            };
        });
        
        const ctx = document.getElementById('radar-chart').getContext('2d');
        charts.radar = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: labels,
                datasets: datasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    legend: {
                        position: 'top'
                    }
                }
            }
        });
        
        // Update colors based on current theme
        updateChartColors(charts.radar);
    }

    // UI Event Handlers
    downloadAllBtn.addEventListener('click', () => {
        const chartIds = ['bar-chart', 'line-chart', 'pie-chart', 'doughnut-chart', 'polar-chart', 'radar-chart'];
        
        chartIds.forEach(id => {
            const canvas = document.getElementById(id);
            if (canvas) {
                downloadChart(canvas, id.replace('-chart', ''));
            }
        });
    });

    toggleGridBtn.addEventListener('click', () => {
        dashboardGrid.classList.toggle('fullwidth');
        toggleGridBtn.textContent = dashboardGrid.classList.contains('fullwidth') 
            ? 'Switch to Grid Layout'
            : 'Toggle Layout';
    });
    
    // Insights event handlers
    generateInsightsBtn.addEventListener('click', generateInsights);
    refreshInsightsBtn.addEventListener('click', generateInsights);

    // Add event listeners for each chart's actions
    document.querySelectorAll('.download-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const chartId = btn.getAttribute('data-chart');
            const canvas = document.getElementById(chartId);
            if (canvas) {
                downloadChart(canvas, chartId.replace('-chart', ''));
            }
        });
    });

    document.querySelectorAll('.expand-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const chartId = btn.getAttribute('data-chart');
            const chartCanvas = document.getElementById(chartId);
            const chartTitle = btn.closest('.chart-container').querySelector('h3').textContent;
            
            if (chartCanvas && charts[chartId.replace('-chart', '')]) {
                openChartModal(chartTitle, chartId.replace('-chart', ''));
            }
        });
    });

    closeModalBtn.addEventListener('click', closeModal);
    modalBackdrop.addEventListener('click', closeModal);

    function openChartModal(title, chartType) {
        modalTitle.textContent = title;
        chartModal.style.display = 'block';
        modalBackdrop.style.display = 'block';
        
        // Clone the chart configuration and create a new chart in the modal
        const originalChart = charts[chartType];
        if (originalChart) {
            const modalCtx = modalChart.getContext('2d');
            
            // Destroy existing modal chart if there is one
            if (charts.modal) {
                charts.modal.destroy();
            }
            
            // Create new chart with the same configuration
            charts.modal = new Chart(modalCtx, {
                type: originalChart.config.type,
                data: JSON.parse(JSON.stringify(originalChart.data)),
                options: JSON.parse(JSON.stringify(originalChart.options))
            });
            
            // Update to match current theme
            updateChartColors(charts.modal);
        }
    }

    function closeModal() {
        chartModal.style.display = 'none';
        modalBackdrop.style.display = 'none';
        
        // Destroy modal chart to free resources
        if (charts.modal) {
            charts.modal.destroy();
            charts.modal = null;
        }
    }

    function downloadChart(canvas, chartName) {
        const link = document.createElement('a');
        link.download = `${chartName}-chart.png`;
        link.href = canvas.toDataURL('image/png');
        link.click();
    }

    // File upload handling
    uploadArea.addEventListener('click', () => {
        fileInput.click();
    });

    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        
        if (e.dataTransfer.files.length) {
            fileInput.files = e.dataTransfer.files;
            handleFileUpload(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleFileUpload(e.target.files[0]);
        }
    });

    // Initialize the application
    initTheme();
});

// Sample CSV data generator for testing
function generateSampleCSV() {
    const header = 'Category,Month,Sales,Profit,Customers,Items\n';
    const categories = ['Electronics', 'Clothing', 'Food', 'Books', 'Home'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    let rows = [];
    
    for (const category of categories) {
        for (const month of months) {
            const sales = Math.floor(1000 + Math.random() * 9000);
            const profit = Math.floor(sales * (0.1 + Math.random() * 0.3));
            const customers = Math.floor(50 + Math.random() * 200);
            const items = Math.floor(100 + Math.random() * 500);
            
            rows.push(`${category},${month},${sales},${profit},${customers},${items}`);
        }
    }
    
    return header + rows.join('\n');
} 