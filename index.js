
// finding the shortest way from one to another airport
const shortestDistanceNode = (distances, visited) => {
	let shortest = null;

	for (let node in distances) {
		let currentIsShortest =
			shortest === null || distances[node] < distances[shortest];
		if (currentIsShortest && !visited.includes(node)) {
			shortest = node;
		}
	}
	return shortest;
};



const findShortestPath = (graph, startNode, endNode) => {
	let distances = {};
	distances[endNode] = "Infinity";
	distances = Object.assign(distances, graph[startNode]);

	// track paths
	let parents = { endNode: null };
	for (let child in graph[startNode]) {
		parents[child] = startNode;
	}

	let visited = [];

	let node = shortestDistanceNode(distances, visited);

	while (node) {
		let distance = distances[node];
		let children = graph[node];
		for (let child in children) {
			if (String(child) === String(startNode)) {
				continue;
			} else {
				let newdistance = distance + children[child];
				if (!distances[child] || distances[child] > newdistance) {
					distances[child] = newdistance;
					parents[child] = node;
				}
			}
		}
		visited.push(node);
		node = shortestDistanceNode(distances, visited);
	}

	let shortestPath = [endNode];
	let parent = parents[endNode];
	while (parent) {
		shortestPath.push(parent);
		parent = parents[parent];
	}
	shortestPath.reverse();

	// returning final path dashed
	let finalPath = shortestPath.join(" - ")
	return finalPath;
};



// list of airport connections
const originalAirportConnections = [
    ['ATH','EDI'],
    ['ATH','GLA'],
    ['ATH','CTA'],
    ['BFS','CGN'],
    ['BFS','LTN'],
    ['BFS','CTA'],
    ['BTS','STN'],
    ['BTS','BLQ'],
    ['CRL','BLQ'],
    ['CRL','BSL'],
    ['CRL','LTN'],
    ['DUB','LCA'],
    ['LTN','DUB'],
    ['LTN','MAD'],
    ['LCA','HAM'],
    ['EIN','BUD'],
    ['EIN','MAD'],
    ['HAM','BRS'],
    ['KEF','LPL'],
    ['KEF','CGN'],
    ['SUF','LIS'],
    ['SUF','BUD'],
    ['SUF','STN'],
    ['STN','EIN'],
    ['STN','HAM'],
    ['STN','DUB'],
    ['STN','KEF']
];
// list of reversed airport connections
let reversedAirportConnections = originalAirportConnections.map(function reverseArray(item) {
    return Array.isArray(item) && Array.isArray(item[0])
               ? item.map(reverseArray)
               : item.slice().reverse();
});

// list of all avaliable airport connections
const airportConnections = originalAirportConnections.concat(reversedAirportConnections);


// implementing graph
const toNeighborList =  function(edgeList){
    const neighborList = {};

    for(let edge of edgeList){
        const start = edge[0];
        const end = edge[1];

        if(neighborList[start] != undefined){
            neighborList[start][end] = 1;
        }else{
            neighborList[start] = {[end]: 1};
        }

    }
    return neighborList;

}


class Flight{
    constructor(startFlight, endFlight, fastestPath){
        this.startFlight = startFlight;
        this.endFlight = endFlight;
        this.fastestPath = fastestPath;
    }
}

class UI {
    static displayFlights() {
      const flights = Store.getFlights();

      flights.forEach((flight) => UI.addFlightToList(flight));
    }


    static addFlightToList(flight) {
      const list = document.querySelector('#flight-list');

      const row = document.createElement('tr');

      row.innerHTML = `
        <td>${flight.startFlight}</td>
        <td>${flight.endFlight}</td>
        <td>${flight.fastestPath}</td>
      `;

      list.appendChild(row);
    }

    static showAlert(message, className) {
      const div = document.createElement('div');
      div.className = `alert alert-${className}`;
      div.appendChild(document.createTextNode(message));
      const container = document.querySelector('#flight-submit-form');
      const form = document.querySelector('#submit-form');
      container.insertBefore(div, form);


      // Vanish in 3 seconds
      setTimeout(() => document.querySelector('.alert').remove(), 3000);
    }
}


  // Store Class: Handles Storage
  class Store {
    static getFlights() {
      let flights;
      if(localStorage.getItem('flights') === null) {
        flights = [];
      } else {
        flights = localStorage.getItem('flights');
      }

      return flights;
    }

    static addFlight(flight) {
      const flights = Store.getFlights();
      localStorage.setItem('flights', flights);
    }
}

    form = document.querySelector('#submit-form');

    form.addEventListener('submit', (e) => {
    // Prevent actual submit
    e.preventDefault();

    // Get form values

    const startPath = document.getElementById('from');
    const endPath = document.getElementById('finish');
    const start = startPath.options[startPath.selectedIndex].text;
    const end = endPath.options[endPath.selectedIndex].text;
	const startValue = startPath.options[startPath.selectedIndex].value;
    const endValue = endPath.options[endPath.selectedIndex].value;
	const fastestPath = findShortestPath(toNeighborList(airportConnections), startValue, endValue)

    if(start === end) {
      UI.showAlert(`You can not go from ${start} to ${end}, choose different path.`, 'danger');
    }else {
      const flight = new Flight(start, end, fastestPath);

      UI.addFlightToList(flight);

      Store.addFlight(flight);
      UI.showAlert('Added', 'success');
    }
});
