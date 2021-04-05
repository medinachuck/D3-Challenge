// // Set SVG parameters
var svgWidth = 960;
var svgHeight = 500;

var margin = {
    top: 20,
    right: 40,
    bottom: 80,
    left: 100,
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Initial Params
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

// function used for updating x-scale var upon click on axis label
function xScale(demographics_data, chosenXAxis) {
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(demographics_data, d => d[chosenXAxis]) * 0.9,
            d3.max(demographics_data, d => d[chosenXAxis]) * 1.1
        ])
        .range([0, width]);
    
    return xLinearScale;
}

// function used for updating y-scale var upon click on axis label
function yScale(demographics_data, chosenYAxis) {
      // create scales
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(demographics_data, d => d[chosenYAxis]) * 0.9,
            d3.max(demographics_data, d => d[chosenYAxis]) * 1.1
        ])
        .range([height, 0]);
    
    return yLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderxAxis(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
    .duration(1000)
    .call(bottomAxis);

    return xAxis;
}

// function used for updating yAxis var upon click on axis label
function renderyAxis(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);

    yAxis.transition()
    .duration(1000)
    .call(leftAxis);

    return yAxis;
}

// function used for updating xAxis for circles group with a transition to
// new circles
function xrenderCircles(circlesGroup, newXScale, chosenXAxis) {
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[chosenXAxis]));
    return circlesGroup;
}

// function used for updating yAxis for circles group with a transition to
// new circles
function yrenderCircles(circlesGroup, newYScale, chosenYAxis) {
    circlesGroup.transition()
        .duration(1000)
        .attr("cy", d => newYScale(d[chosenYAxis]));
    return circlesGroup;
}

// function to update state abbreviation text position of circles on x axis
function xrendercircletext(circlesGroup, newXScale, chosenXAxis) {
    circlesGroup.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[chosenXAxis]));
    return circlesGroup;
}

// function to update state abbreviation text position of circles on x axis
function yrendercircletext(circlesGroup, newYScale, chosenYAxis) {
    circlesGroup.transition()
        .duration(1000)
        .attr("y", d => newYScale(d[chosenYAxis]));
    return circlesGroup;
}
// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {
    var xlabel;
    var ylabel;

    // if xAxis is changed
    if (chosenXAxis === "poverty") {
        xlabel = "Poverty:";
    }
    else if (chosenXAxis === "age") {
        xlabel = "Age Median:";
    }
    else {
        xlabel = "Household Income Median:"
    }

    // if yAxis is changed
    if (chosenYAxis === "healthcare") {
        ylabel = "Healthcare:";
    }
    else if (chosenYAxis === "smokes") {
        ylabel = "Smokes:";
    }
    else {
        ylabel = "Obesity:"
    }

    var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([80, -60])
        .html(function(d) {
            // separate formats for percentages and medians
            if (chosenXAxis !== "poverty") {
                return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}<br>${ylabel} ${d[chosenYAxis]}%`);
            }
            else {
                return (`${d.state}<br>${xlabel} ${d[chosenXAxis]}%<br>${ylabel} ${d[chosenYAxis]}%`);

            }
        });
    
    circlesGroup.call(toolTip);

    circlesGroup.on("mouseover", function(data) {
        toolTip.show(data);
    })
        // onmouseout event
        .on("mouseout", function(data, index) {
            toolTip.hide(data);
        });

    return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(demographics_data, err) {
    if (err) throw err;

    // parse data
    demographics_data.forEach(function(data) {
        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
        data.healthcare = +data.healthcare;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;
    });

    // LinearScale functions above csv import
    var xLinearScale = xScale(demographics_data, chosenXAxis);
    var yLinearScale = yScale(demographics_data, chosenYAxis);

    // Create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append("g")
        .classed("x-axis", true)
        .attr("transform", `translate(0, ${height})`)
        .call(bottomAxis);

    // append y axis
    var yAxis = chartGroup.append("g")
        .classed("y-axis", true)
        .call(leftAxis);

    // append initial circles
    var circlesGroup = chartGroup.selectAll("circle")
        .data(demographics_data)
        .enter()
        .append("circle")
        .attr("cx", d => xLinearScale(d[chosenXAxis]))
        .attr("cy", d => yLinearScale(d[chosenYAxis]))
        .attr("r", 15)
        .attr("opacity", ".75")
        .classed("stateCircle", true);

    // append states abbreviations inside circles
    var circlesText = chartGroup.selectAll()
        .data(demographics_data)
        .enter()
        .append("text")
        .classed("stateText", true)
        .attr("x", d => xLinearScale(d[chosenXAxis]))
        .attr("y", (d,i) => yLinearScale(d[chosenYAxis])+4)
        .text(d => (d.abbr))

    // Create group for three x-axis labels and append them
    var xlabelsGroup = chartGroup.append("g")
        .attr("transform", `translate(${width / 2}, ${height + 20})`);

    var povertyLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 20)
        .attr("value", "poverty")
        .classed("active", true)
        .classed("aText", true)
        .text("In Poverty (%)")

    var ageLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 40)
        .attr("value", "age")
        .classed("inactive", true)
        .classed("aText", true)
        .text("Age (Median)")

    var incomeLabel = xlabelsGroup.append("text")
        .attr("x", 0)
        .attr("y", 60)
        .attr("value", "income")
        .classed("inactive", true)
        .classed("aText", true)
        .text("Household Income (Median)")

    // Create group for three y-axis labels and append them
    var ylabelsGroup = chartGroup.append("g")
        .attr("transform", "rotate(-90)")

    var obeseLabel = ylabelsGroup.append("text")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("value", "obesity")
        .attr("dy", "1em")
        .classed("inactive", true)
        .classed("aText", true)
        .text("Obese (%)");

    var smokesLabel = ylabelsGroup.append("text")
        .attr("y", 0 - margin.left+20)
        .attr("x", 0 - (height / 2))
        .attr("value", "smokes")
        .attr("dy", "1em")
        .classed("inactive", true)
        .classed("aText", true)
        .text("Smokes (%)");

    var healthcareLabel = ylabelsGroup.append("text")
        .attr("y", 0 - margin.left+40)
        .attr("x", 0 - (height / 2))
        .attr("value", "healthcare")
        .attr("dy", "1em")
        .classed("active", true)
        .classed("aText", true)
        .text("Lacks Healthcare (%)");

    // updateToolTip function above csv import
    var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

    // x axis labels event listener
    xlabelsGroup.selectAll("text")
        .on("click", function() {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenXAxis) {
                // replaces chosenXAxis with value
                chosenXAxis = value;
                // updates x scale for new data
                xLinearScale = xScale(demographics_data, chosenXAxis);
                // updates x axis with transition
                xAxis = renderxAxis(xLinearScale, xAxis);
                // updates circles with new x values
                circlesGroup = xrenderCircles(circlesGroup, xLinearScale, chosenXAxis);
                // updates circles with new text position
                circlesText = xrendercircletext(circlesText, xLinearScale, chosenXAxis);
                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
                // changes classes to change bold text
                if (chosenXAxis === "age") {
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenXAxis === "income") {
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
            }
        });
        
    // y axis labels event listener
    ylabelsGroup.selectAll("text")
        .on("click", function() {
            // get value of selection
            var value = d3.select(this).attr("value");
            if (value !== chosenYAxis) {
                // replaces chosenYAxis with value
                chosenYAxis = value;
                // updates y scale for new data
                yLinearScale = yScale(demographics_data, chosenYAxis);
                // updates y axis with transition
                yAxis = renderyAxis(yLinearScale, yAxis);
                // updates circles with new y values
                circlesGroup = yrenderCircles(circlesGroup, yLinearScale, chosenYAxis);
                // updates circles with new text position
                circlesText = yrendercircletext(circlesText, yLinearScale, chosenYAxis);
                // updates tooltips with new info
                circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);
                // changes classes to change bold text
                if (chosenYAxis === "smokes") {
                    smokesLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    obeseLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenYAxis === "obesity") {
                    obeseLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    healthcareLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obeseLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
            }
        });
}).catch(function(error) {
    console.log(error);
});
