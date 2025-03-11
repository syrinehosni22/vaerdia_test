import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  Rectangle,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const NonStackedBarChart = () => {
  const [neos, setNeos] = useState([]);
  const [filteredNeos, setFilteredNeos] = useState([]);
  const [selectedOrbitingBodies, setSelectedOrbitingBodies] = useState([]); // Array to store selected orbiting bodies
  const [orbitingBodies, setOrbitingBodies] = useState([]); // Track available orbiting bodies

  useEffect(() => {
    fetch("https://api.nasa.gov/neo/rest/v1/neo/browse?api_key=DEMO_KEY") // Replace with your API URL
      .then((response) => response.json())
      .then((data) => {
        const neosData = data.near_earth_objects.map((neo) => {
          // Iterate through each close approach data entry and get the orbiting bodies
          const orbitingBodiesArray = neo.close_approach_data.map(
            (approach) => approach.orbiting_body
          );

          // Get the unique orbiting bodies for this NEO
          const uniqueOrbitingBodies = [...new Set(orbitingBodiesArray)];

          return {
            name: neo.name,
            MaxED: neo.estimated_diameter.kilometers.estimated_diameter_max,
            MinED: neo.estimated_diameter.kilometers.estimated_diameter_min,
            orbiting_bodies: uniqueOrbitingBodies, // Store all orbiting bodies this NEO is associated with
          };
        });

        // Get unique orbiting bodies across all NEOs
        const allOrbitingBodies = [
          ...new Set(neosData.flatMap((neo) => neo.orbiting_bodies)),
        ];

        setOrbitingBodies(allOrbitingBodies);

        // Sorting the data by the average of MaxED and MinED
        const sortedNeosData = neosData.sort((a, b) => {
          const avgA = (a.MaxED + a.MinED) / 2;
          const avgB = (b.MaxED + b.MinED) / 2;
          return avgB - avgA;
        });

        setNeos(sortedNeosData);
        setFilteredNeos(sortedNeosData); // Initially show all NEOs
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  useEffect(() => {
    // Filter the NEOs based on the selected orbiting bodies
    if (selectedOrbitingBodies.length > 0) {
      setFilteredNeos(
        neos.filter((neo) =>
          neo.orbiting_bodies.some((body) =>
            selectedOrbitingBodies.includes(body)
          )
        )
      );
    } else {
      setFilteredNeos(neos); // Show all if no filter is applied
    }
  }, [selectedOrbitingBodies, neos]);

  const handleCheckboxChange = (event) => {
    const value = event.target.value;
    setSelectedOrbitingBodies(
      (prev) =>
        prev.includes(value)
          ? prev.filter((body) => body !== value) // Unselect the body if already selected
          : [...prev, value] // Add the body if not selected
    );
  };
  const itemHeight = 40; // Adjust this value as needed
  const chartHeight = Math.max(filteredNeos.length * itemHeight, 300); // Minimum height

  return (
    <div>
      <div className="filter-container">
        <span>Select Orbiting Bodies</span>
        <div className="filter-list">
          {orbitingBodies.length > 0 ? (
            orbitingBodies.map((body) => (
              <label key={body} className="filter-item">
                <input
                  type="checkbox"
                  value={body}
                  checked={selectedOrbitingBodies.includes(body)}
                  onChange={handleCheckboxChange}
                />
                {body}
              </label>
            ))
          ) : (
            <span>Loading...</span>
          )}
        </div>
      </div>

      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={filteredNeos}
          layout="vertical"
          margin={{ top: 5, right: 30, left: 50, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis interval={0} type="number" />
          <YAxis dataKey="name" type="category" width={200} />
          <Tooltip />
          <Legend />
          <Bar
            dataKey="MaxED"
            fill="#0000ff"
            name="Maximum Estimated Diameter"
            activeBar={<Rectangle fill="#0000ff" stroke="blue" />}
          />
          <Bar
            dataKey="MinED"
            fill="#ff0000"
            name="Minimum Estimated Diameter"
            activeBar={<Rectangle fill="#ff0000" stroke="red" />}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default NonStackedBarChart;
