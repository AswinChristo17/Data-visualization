/**
 * Data Insights Generator
 * Automatically analyzes CSV data and generates meaningful insights.
 */
class InsightsGenerator {
    constructor(data, columns) {
        this.data = data;
        this.columns = columns;
        this.numericColumns = columns.filter(column => 
            data.some(row => typeof row[column] === 'number')
        );
        this.categoricalColumns = columns.filter(column => 
            !this.numericColumns.includes(column) && 
            data.some(row => row[column] !== null && row[column] !== '')
        );
        this.insights = [];
    }

    /**
     * Generate all insights based on the data
     */
    generateAllInsights() {
        this.insights = [];
        
        // Generate basic statistical insights
        this.generateBasicStats();
        
        // Generate trend insights
        this.generateTrendInsights();
        
        // Generate correlation insights
        this.generateCorrelationInsights();
        
        // Generate outlier insights
        this.generateOutlierInsights();
        
        // Generate distribution insights
        this.generateDistributionInsights();
        
        return this.insights;
    }

    /**
     * Generate basic statistical insights (max, min, average, etc.)
     */
    generateBasicStats() {
        if (this.numericColumns.length === 0) return;
        
        this.numericColumns.forEach(column => {
            const values = this.data.map(row => row[column]).filter(val => val !== null && !isNaN(val));
            
            if (values.length === 0) return;
            
            // Calculate basic statistics
            const max = ss.max(values);
            const min = ss.min(values);
            const mean = ss.mean(values);
            const median = ss.median(values);
            const sum = ss.sum(values);
            
            // Add max value insight
            const maxRow = this.data.find(row => row[column] === max);
            if (maxRow) {
                let maxDescription = `The highest ${column} value is ${max.toLocaleString()}.`;
                
                // If we have categorical columns, add context
                if (this.categoricalColumns.length > 0) {
                    const category = this.categoricalColumns[0];
                    maxDescription += ` It occurred in ${maxRow[category]}.`;
                }
                
                this.insights.push({
                    type: 'max',
                    title: `Highest ${column}`,
                    value: max.toLocaleString(),
                    description: maxDescription,
                    importance: 'primary'
                });
            }
            
            // Add average insight
            this.insights.push({
                type: 'average',
                title: `Average ${column}`,
                value: mean.toLocaleString(undefined, {maximumFractionDigits: 2}),
                description: `The average ${column} is ${mean.toLocaleString(undefined, {maximumFractionDigits: 2})}.`,
                importance: 'secondary'
            });
            
            // Check for skewness in the data
            const skewness = ss.sampleSkewness(values);
            if (Math.abs(skewness) > 1) {
                const skewType = skewness > 0 ? 'positive' : 'negative';
                const skewDescription = skewness > 0 
                    ? `The ${column} distribution is skewed toward higher values.`
                    : `The ${column} distribution is skewed toward lower values.`;
                
                this.insights.push({
                    type: 'distribution',
                    title: `${column} Distribution`,
                    value: skewType,
                    description: skewDescription,
                    importance: 'secondary'
                });
            }
        });
    }

    /**
     * Generate insights about trends in the data over time or categories
     */
    generateTrendInsights() {
        // Only proceed if we have at least one categorical and one numeric column
        if (this.categoricalColumns.length === 0 || this.numericColumns.length === 0) return;
        
        const categoryColumn = this.categoricalColumns[0];
        
        this.numericColumns.forEach(numericColumn => {
            // Group by category and calculate sums/averages
            const grouped = {};
            this.data.forEach(row => {
                const category = row[categoryColumn];
                const value = row[numericColumn];
                
                if (category && value !== null && !isNaN(value)) {
                    if (!grouped[category]) {
                        grouped[category] = {
                            values: [],
                            sum: 0,
                            count: 0
                        };
                    }
                    
                    grouped[category].values.push(value);
                    grouped[category].sum += value;
                    grouped[category].count++;
                }
            });
            
            // Check for categories that have significantly higher/lower values
            const categories = Object.keys(grouped);
            if (categories.length < 2) return; // Need at least 2 categories to compare
            
            // Calculate average for each category
            categories.forEach(category => {
                grouped[category].average = grouped[category].sum / grouped[category].count;
            });
            
            // Get overall average across all categories
            const overallAverage = categories.reduce((sum, category) => sum + grouped[category].sum, 0) /
                                  categories.reduce((count, category) => count + grouped[category].count, 0);
            
            // Find significant deviations
            categories.forEach(category => {
                const catAvg = grouped[category].average;
                const deviation = (catAvg - overallAverage) / overallAverage * 100;
                
                // If deviation is more than 20%, highlight it
                if (Math.abs(deviation) > 20) {
                    const direction = deviation > 0 ? 'higher' : 'lower';
                    const significanceClass = deviation > 0 ? 'positive' : 'negative';
                    
                    this.insights.push({
                        type: 'trend',
                        title: `${category} ${numericColumn}`,
                        value: catAvg.toLocaleString(undefined, {maximumFractionDigits: 2}),
                        description: `${category} has a ${Math.abs(deviation).toFixed(1)}% ${direction} ${numericColumn} than average.`,
                        importance: Math.abs(deviation) > 40 ? 'primary' : 'secondary',
                        class: significanceClass
                    });
                }
            });
            
            // Check for trends over time if category appears to be time-related
            // (e.g., Month, Date, Year in the column name)
            if (categoryColumn.toLowerCase().includes('month') || 
                categoryColumn.toLowerCase().includes('date') || 
                categoryColumn.toLowerCase().includes('year') ||
                categoryColumn.toLowerCase().includes('day')) {
                
                // Try to detect if categories can be ordered (e.g., Jan, Feb, Mar...)
                // For this example, just check if it's our sample month data
                const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                const isMonthData = categories.every(cat => months.includes(cat));
                
                if (isMonthData) {
                    // Order data by month
                    const orderedData = months.filter(month => categories.includes(month))
                        .map(month => ({
                            category: month,
                            value: grouped[month].average
                        }));
                    
                    // Check for trend - simple linear regression
                    const xValues = orderedData.map((_, i) => i);
                    const yValues = orderedData.map(item => item.value);
                    
                    const linReg = ss.linearRegression(xValues.map((x, i) => [x, yValues[i]]));
                    const slope = linReg.m;
                    
                    // If there's a meaningful trend
                    if (Math.abs(slope) > 0.05 * overallAverage) {
                        const trendDirection = slope > 0 ? 'increasing' : 'decreasing';
                        const lastValue = orderedData[orderedData.length - 1].value;
                        const firstValue = orderedData[0].value;
                        const percentChange = ((lastValue - firstValue) / firstValue) * 100;
                        
                        this.insights.push({
                            type: 'trend',
                            title: `${numericColumn} Trend`,
                            value: `${trendDirection}`,
                            description: `${numericColumn} is ${trendDirection} over time. There's been a ${Math.abs(percentChange).toFixed(1)}% ${percentChange > 0 ? 'increase' : 'decrease'} from ${orderedData[0].category} to ${orderedData[orderedData.length - 1].category}.`,
                            importance: 'primary',
                            class: slope > 0 ? 'positive' : 'negative'
                        });
                    }
                }
            }
        });
    }

    /**
     * Generate insights about correlations between different metrics
     */
    generateCorrelationInsights() {
        // Need at least 2 numeric columns to calculate correlation
        if (this.numericColumns.length < 2) return;
        
        // Check correlations between pairs of numeric columns
        for (let i = 0; i < this.numericColumns.length; i++) {
            for (let j = i + 1; j < this.numericColumns.length; j++) {
                const col1 = this.numericColumns[i];
                const col2 = this.numericColumns[j];
                
                // Get pairs of values where both are present
                const pairs = this.data
                    .filter(row => row[col1] !== null && !isNaN(row[col1]) && 
                                   row[col2] !== null && !isNaN(row[col2]))
                    .map(row => [row[col1], row[col2]]);
                
                if (pairs.length < 5) continue; // Need enough data points
                
                // Calculate correlation coefficient
                const col1Values = pairs.map(pair => pair[0]);
                const col2Values = pairs.map(pair => pair[1]);
                
                const correlation = ss.sampleCorrelation(col1Values, col2Values);
                
                // If correlation is significant
                if (Math.abs(correlation) > 0.7) {
                    const relationshipType = correlation > 0 ? 'positive' : 'negative';
                    const strengthDesc = Math.abs(correlation) > 0.9 ? 'strong' : 'moderate';
                    
                    this.insights.push({
                        type: 'correlation',
                        title: `${col1} & ${col2} Correlation`,
                        value: correlation.toFixed(2),
                        description: `There's a ${strengthDesc} ${relationshipType} correlation between ${col1} and ${col2}. As one increases, the other tends to ${correlation > 0 ? 'increase' : 'decrease'}.`,
                        importance: Math.abs(correlation) > 0.9 ? 'primary' : 'secondary',
                        class: 'info'
                    });
                }
            }
        }
    }

    /**
     * Generate insights about outliers in the data
     */
    generateOutlierInsights() {
        this.numericColumns.forEach(column => {
            const values = this.data.map(row => row[column]).filter(val => val !== null && !isNaN(val));
            
            if (values.length < 5) return; // Need enough data points
            
            // Calculate quartiles and IQR
            const q1 = ss.quantile(values, 0.25);
            const q3 = ss.quantile(values, 0.75);
            const iqr = q3 - q1;
            
            // Define outlier thresholds
            const lowerThreshold = q1 - 1.5 * iqr;
            const upperThreshold = q3 + 1.5 * iqr;
            
            // Find outliers
            const outliers = this.data.filter(row => 
                row[column] !== null && 
                !isNaN(row[column]) &&
                (row[column] < lowerThreshold || row[column] > upperThreshold)
            );
            
            if (outliers.length > 0) {
                // Calculate percentage of data points that are outliers
                const outlierPercentage = (outliers.length / values.length) * 100;
                
                // If there's a significant number of outliers
                if (outlierPercentage > 5) {
                    this.insights.push({
                        type: 'outlier',
                        title: `${column} Outliers`,
                        value: `${outliers.length} (${outlierPercentage.toFixed(1)}%)`,
                        description: `${outliers.length} ${column} values (${outlierPercentage.toFixed(1)}% of the data) are outliers that differ significantly from the typical range.`,
                        importance: outlierPercentage > 10 ? 'primary' : 'secondary',
                        class: 'warning'
                    });
                }
                
                // Highlight the most extreme outlier
                if (outliers.length > 0) {
                    // Find most extreme outlier
                    const extremeOutlier = outliers.reduce((maxOutlier, current) => {
                        const currentDeviation = Math.abs((current[column] - ss.mean(values)) / ss.standardDeviation(values));
                        const maxDeviation = Math.abs((maxOutlier[column] - ss.mean(values)) / ss.standardDeviation(values));
                        return currentDeviation > maxDeviation ? current : maxOutlier;
                    }, outliers[0]);
                    
                    // Format additional info about the outlier
                    let outlierDescription = `There's an unusually ${extremeOutlier[column] > upperThreshold ? 'high' : 'low'} ${column} value of ${extremeOutlier[column].toLocaleString()}.`;
                    
                    if (this.categoricalColumns.length > 0) {
                        const category = this.categoricalColumns[0];
                        outlierDescription += ` It was observed in ${extremeOutlier[category]}.`;
                    }
                    
                    this.insights.push({
                        type: 'extreme_outlier',
                        title: `Extreme ${column} Value`,
                        value: extremeOutlier[column].toLocaleString(),
                        description: outlierDescription,
                        importance: 'secondary',
                        class: 'warning'
                    });
                }
            }
        });
    }

    /**
     * Generate insights about the distribution of values
     */
    generateDistributionInsights() {
        // Analyze distribution for categorical columns
        this.categoricalColumns.forEach(column => {
            // Count frequency of each category
            const distribution = {};
            this.data.forEach(row => {
                const value = row[column];
                if (value !== null && value !== '') {
                    distribution[value] = (distribution[value] || 0) + 1;
                }
            });
            
            const categories = Object.keys(distribution);
            if (categories.length < 2) return;
            
            // Find dominant category
            const totalCount = this.data.length;
            let dominantCategory = categories[0];
            categories.forEach(category => {
                if (distribution[category] > distribution[dominantCategory]) {
                    dominantCategory = category;
                }
            });
            
            const dominantPercentage = (distribution[dominantCategory] / totalCount) * 100;
            
            // If one category is significantly dominant
            if (dominantPercentage > 50) {
                this.insights.push({
                    type: 'distribution',
                    title: `${column} Distribution`,
                    value: dominantCategory,
                    description: `${dominantCategory} accounts for ${dominantPercentage.toFixed(1)}% of all ${column} values. It's the most dominant category.`,
                    importance: dominantPercentage > 75 ? 'primary' : 'secondary',
                    class: 'info'
                });
            }
            
            // Check for unusually low representation
            const expectedPercentage = 100 / categories.length;
            categories.forEach(category => {
                const percentage = (distribution[category] / totalCount) * 100;
                
                if (percentage < expectedPercentage / 2 && percentage < 10) {
                    this.insights.push({
                        type: 'distribution',
                        title: `Low ${column} Representation`,
                        value: category,
                        description: `${category} only represents ${percentage.toFixed(1)}% of the data, which is unusually low.`,
                        importance: 'secondary',
                        class: 'warning'
                    });
                }
            });
        });
        
        // Analyze numeric columns for normal distribution
        this.numericColumns.forEach(column => {
            const values = this.data.map(row => row[column]).filter(val => val !== null && !isNaN(val));
            
            if (values.length < 10) return; // Need enough data points
            
            // Check if data follows normal distribution (approximate check)
            // Using skewness and kurtosis
            const skewness = ss.sampleSkewness(values);
            const kurtosis = ss.sampleKurtosis(values);
            
            const isNormal = Math.abs(skewness) < 0.5 && Math.abs(kurtosis) < 1;
            
            if (isNormal) {
                this.insights.push({
                    type: 'distribution',
                    title: `${column} Distribution`,
                    value: 'Normal',
                    description: `${column} appears to follow a normal distribution, suggesting naturally occurring or expected variation.`,
                    importance: 'secondary',
                    class: 'info'
                });
            } else if (Math.abs(skewness) > 1) {
                // Identify if distribution is skewed
                const skewType = skewness > 0 ? 'right' : 'left';
                this.insights.push({
                    type: 'distribution',
                    title: `${column} Distribution`,
                    value: `Skewed ${skewType}`,
                    description: `${column} has a ${skewType}-skewed distribution, with ${skewness > 0 ? 'more values below average but some extremely high values' : 'more values above average but some extremely low values'}.`,
                    importance: 'secondary',
                    class: 'info'
                });
            }
        });
    }
}

// Make available globally
window.InsightsGenerator = InsightsGenerator; 