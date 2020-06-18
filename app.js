const drawBar = dataset =>{
    let data;
    if (selector == false){
        data = dataset.sort(function(a,b) {return b.garbage_per_person - a.garbage_per_person}).slice(0, 10);
    } else {
        data = dataset.sort(function(a,b) {return b.garbage_per_region - a.garbage_per_region}).slice(0, 10);
    };
    console.log(data)
    
    let xScale = d3.scaleLinear()
                .domain([0, d3.max(data, function(d){
                    if (selector == false){
                        return d.garbage_per_person;
                    }
                    return d.garbage_per_region;
                })]);
    let yScale = d3.scaleBand().paddingInner(0.05)
                .domain(data.map(d => d.region));
    let yAxis = d3.axisLeft(yScale)
                .tickSizeOuter(0);
    let xAxis = d3.axisBottom(xScale)   
                .tickFormat(function(d){
                    if (selector == false){
                        return d + " куб.м.";
                    }
                    let format = d3.format(".2s");
                    return format(d*1000).replace('.0', '') + ' куб.м.';
                })
                .ticks(8)
                .tickSizeOuter(0);
    g.selectAll('rect')
                .data(data)
                .enter()
                .append('rect')
                .attr('class', 'bar')
                .attr('fill', function(){
                        return '#99372E';
                })
                .on('mouseover', (d,i,n) =>{
                    mouseover(d, n[i]);
                  })
                .on('mouseleave', function(){
                    d3.select(this).attr('fill', '#99372E')
                    tooltip
                      .transition()
                      .duration(200)
                      .style('opacity', 0)
                });
            
    g.append('g')
                .attr('class', 'y-axis');
    g.append('g')
                .attr('class', 'x-axis');

    const resize = () => {
        let bounds = svg.node().getBoundingClientRect();
        let w = bounds.width;
        let h = w/2;
        margin.left = w/5.5;
        margin.right = w/30;
        margin.bottom = w/48
        margin.top = w/45
        console.log(w, h)
        xScale.range([0, w - margin.right - margin.left]);
        yScale.range([0, h - margin.top - margin.bottom]);
        svg
            .attr('height', h + margin.top + margin.bottom);
        g.selectAll('.bar')
            .attr('width', function(d){
                if (selector == false){
                    return xScale(d.garbage_per_person);
                }
                return xScale(d.garbage_per_region);
            })
            .attr('y', function(d){
                return yScale(d.region);
            })
            .attr('height', function(d){
                return yScale.bandwidth();
            });
        g.select('.y-axis')
            .call(yAxis)
            .selectAll('.domain, .tick line') //remove tick line
            .remove()

        g.select('.x-axis')
            .attr('transform', `translate(0, ${h - margin.top - margin.bottom})`)
            .call(xAxis)
            .selectAll('.domain') //remove tick tick line
            .remove();
            
        g.attr('transform', `translate(${margin.left}, ${margin.bottom})`);
        d3.select('.caption').attr('transform', `translate(${margin.left/10}, ${h + margin.bottom*1.5})`)
    };
    resize();
    d3.select(window).on('resize', resize);
};

const parseData = d => {
    return {
        region: d.region.replace('область', 'обл.').replace('республика', 'респ.').replace('Республика', "респ."),
        garbage_per_person: parseFloat(d.garbage_per_person),
        garbage_per_region: parseFloat(d.garbage_per_region)
    };
};
let selector = false;
let tooltip = d3.select('body').append('div')
                  .attr('class', 'tooltip')
                  .style('opacity', 0);
const mouseover = function(d, element){

        d3.select(element).attr('fill', '#99B2BF')
        tooltip
                .transition()
                .duration(200)
                .style('opacity', .8)
                .text(function(){
                    if (selector == false){
                        return d.region + ': ' + d3.format('.2f')(d.garbage_per_person) + ' куб.м';
                    }
                    return d.region + ': ' + d3.format(',.0f')(d.garbage_per_region*1000) + ' куб.м.';
                })
                .style('left', function() {
                        let position = d3.event.pageX;
                        let svgWidth = document.getElementById('container').getBoundingClientRect().width;
                        if(position < svgWidth/2) {
                                return (d3.event.pageX + 15) + 'px';
                        } else {
                            return (d3.event.pageX - 50) + 'px';
                        }
                })
                .style('top', (d3.event.pageY -  30) + 'px')
};

const margin = {left: 150, right: 20, top: 20, bottom: 30};
let svg = d3.select('#svgContainer');
let g = svg.append('g');
let caption = svg.append('g').append('text').attr('class', 'caption')
        .text('«Важные истории». Данные: Росстат');
const buttonPerson = d3.select('.button.person').on('click', function(){
    d3.csv('garbage.csv', parseData, drawBar);
    selector = false;
});
const buttonRegion = d3.select('.button.region').on('click', function(){
    selector = true;
    d3.csv('garbage.csv', parseData, drawBar);
});

if (selector == false){
    document.getElementsByClassName('button person')[0].click()
};


