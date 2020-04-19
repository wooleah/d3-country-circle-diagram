import countryByContinent from './country-by-continent.js';
import countryByPopulation from './country-by-population.js';

// const loadData = async () => {
//   const data = await fetch("/.netlify/functions/get-country-pop")
//     .then((res) => res.json())
//     .catch((err) => console.error(err));

//   const canvas = document.querySelector(".canvas");
//   const text = document.createElement("h1");
//   text.innerText = data;

//   canvas.appendChild(text);
// };

// loadData();

// prepare data
let data = [
  { name: 'Earth', parent: '' },
  { name: 'Asia', parent: 'Earth' },
  { name: 'Europe', parent: 'Earth' },
  { name: 'Africa', parent: 'Earth' },
  { name: 'Oceania', parent: 'Earth' },
  { name: 'North America', parent: 'Earth' },
  { name: 'South America', parent: 'Earth' },
];
for (let i = 0; i < countryByContinent.length; ++i) {
  if (countryByPopulation[i].population === null) {
    continue;
  }

  let continent;
  if (!countryByContinent[i].continent) {
    continent = 'Earth';
  } else {
    continent = countryByContinent.find((item) => item.country === countryByPopulation[i].country).continent;
  }

  data.push({
    name: countryByPopulation[i].country,
    parent: continent,
    population: countryByPopulation[i].population,
  });
}

const WIDTH = 900;
const HEIGHT = 900;

// create stratify generator
const stratify = d3
  .stratify()
  .id((d) => d.name)
  .parentId((d) => d.parent);

// create rootNode
const rootNode = stratify(data).sum((d) => +d.population);
const pack = d3.pack().size([WIDTH, HEIGHT]).padding(4);
const bubbleData = pack(rootNode).descendants();

// // create ordinal scale
// const color = d3.scaleOrdinal(["#d1c4e9", "#b39ddb", "#9575cd"]);
const color = (data) => {
  switch (data.id) {
    case 'Earth': {
      return '#BABABA';
    }
    case 'Asia': {
      return '#FF7D56';
    }
    case 'Europe': {
      return '#3B5191';
    }
    case 'Africa': {
      return '#CE61A8';
    }
    case 'Oceania': {
      return '#EDDB68';
    }
    case 'North America': {
      return '#94E0D2';
    }
    case 'South America': {
      return '#EFCBD2';
    }
    // case 'Antarctica': {
    //   return '#7A5C61';
    // }
    default: {
      switch (data.data.parent) {
        case 'Asia': {
          return '#FFD5C9';
        }
        case 'Europe': {
          return '#8289A0';
        }
        case 'Africa': {
          return '#CEA3BF';
        }
        case 'Oceania': {
          return '#E9EDB1';
        }
        case 'North America': {
          return '#C7E0DB';
        }
        case 'South America': {
          return '#EFE6E8';
        }
      }
    }
  }
};

// current focused node
let focusedNode = rootNode;

// create svg
const svg = d3
  .select('.canvas')
  .append('svg')
  // styles
  .attr('width', WIDTH)
  .attr('height', HEIGHT)
  .attr('viewBox', [0, 0, WIDTH, HEIGHT])
  .style('background', '#EFE6E8')
  // .style('background', 'url("./assets/bg.jpg")')
  .style('cursor', 'pointer')
  // events
  .on('click', reset);

// join data and add group for each node
const graph = svg.append('g');
const nodes = graph
  .selectAll('g')
  .data(bubbleData)
  .enter()
  .append('g')
  // events
  .on('mouseover', function () {
    d3.select(this).attr('stroke', '#fff');
  })
  .on('mouseout', function () {
    d3.select(this).attr('stroke', null);
  })
  .on('click', clicked);

nodes
  .append('circle')
  .attr('transform', (d) => `translate(${d.x}, ${d.y})`)
  .attr('r', (d) => d.r)
  .attr('fill', (d) => color(d))
  .attr('pointer-events', (d) => (d.children ? null : 'none'))
  .attr('stroke-width', 2);

svg
  .append('g')
  .selectAll('text')
  .data(bubbleData)
  .enter()
  .append('text')
  .attr('pointer-events', 'none')
  .attr('text-anchor', 'middle')
  // .attr('dy', '0.5em')
  .attr('fill', 'black')
  // .attr('stroke', 'black')
  // .attr('stroke-width', 0.75)
  .style('font', 'bold 16px sans-serif')
  .join('text')
  .attr('transform', (d) => `translate(${d.x}, ${d.y})`)
  .style('fill-opacity', (d) => (d.parent === focusedNode ? 1 : 0))
  .style('display', (d) => (d.parent === focusedNode ? 'inline' : 'none'))
  .text((d) => d.data.name);

// create zoom behavior
const zoom = d3.zoom().on('zoom', function () {
  const { x: tx, y: ty, k } = d3.event.transform;

  svg
    .selectAll('text')
    .attr('transform', (d) => `translate(${d.x * k + tx}, ${d.y * k + ty})`)
    // .transition()
    // .duration(750)
    .style('fill-opacity', (d) => (d.parent === focusedNode ? 1 : 0))
    .style('display', function (d) {
      return d.parent === focusedNode ? 'inline' : 'none';
    });

  graph.attr('transform', d3.event.transform);
});
svg.call(zoom);

function clicked(d) {
  d3.event.stopPropagation();

  focusedNode = d;

  const k = WIDTH / (d.r * 2);
  svg
    .transition()
    .duration(750)
    .call(
      zoom.transform,
      d3.zoomIdentity
        .translate(WIDTH / 2, HEIGHT / 2)
        .scale(k)
        .translate(-d.x, -d.y)
    );

  svg
    .selectAll('text')
    .transition()
    .duration(750)
    .style('fill-opacity', (d) => (d.parent === focusedNode ? 1 : 0));
}

function reset() {
  focusedNode = rootNode;

  svg
    .transition()
    .duration(750)
    .call(zoom.transform, d3.zoomIdentity, d3.zoomTransform(svg.node()).invert([WIDTH / 2, HEIGHT / 2]));

  svg
    .selectAll('text')
    .transition()
    .duration(750)
    .style('fill-opacity', (d) => (d.parent === focusedNode ? 1 : 0));
}
