import { useState, useEffect } from "react";

const NEOsTable = () => {
  const [neos, setNeos] = useState([]);
  const [filteredNeos, setFilteredNeos] = useState([]);
  const [orbitingBodies, setOrbitingBodies] = useState([]);
  const [selectedBody, setSelectedBody] = useState("");

  useEffect(() => {
    fetch("https://api.nasa.gov/neo/rest/v1/neo/browse?api_key=DEMO_KEY")
      .then((response) => response.json())
      .then((data) => {
        const neosData = data.near_earth_objects.map((neo) => {
          const orbitingBodiesArray = neo.close_approach_data.map(
            (approach) => approach.orbiting_body
          );

          const uniqueOrbitingBodies = [...new Set(orbitingBodiesArray)];

          return {
            name: neo.name,
            MaxED: neo.estimated_diameter.kilometers.estimated_diameter_max,
            MinED: neo.estimated_diameter.kilometers.estimated_diameter_min,
            orbiting_bodies: uniqueOrbitingBodies,
          };
        });

        const allOrbitingBodies = [
          ...new Set(neosData.flatMap((neo) => neo.orbiting_bodies)),
        ];

        setOrbitingBodies(allOrbitingBodies);

        const sortedNeosData = neosData.sort((a, b) => {
          const avgA = (a.MaxED + a.MinED) / 2;
          const avgB = (b.MaxED + b.MinED) / 2;
          return avgB - avgA;
        });

        setNeos(sortedNeosData);
        setFilteredNeos(sortedNeosData);
      })
      .catch((error) => console.error("Error fetching data:", error));
  }, []);

  const handleFilterChange = (event) => {
    const selected = event.target.value;
    setSelectedBody(selected);

    if (selected === "") {
      setFilteredNeos(neos);
    } else {
      setFilteredNeos(neos.filter((neo) => neo.orbiting_bodies.includes(selected)));
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Near-Earth Objects (NEOs)</h1>

      {/* Select Dropdown for Orbiting Bodies */}
      <select
        value={selectedBody}
        onChange={handleFilterChange}
        className="primary-button"
      >
        <option value="">Orbiting Bodies</option>
        {orbitingBodies.map((body, index) => (
          <option key={index} value={body}>
            {body}
          </option>
        ))}
      </select>

      {/* Table */}
      <div className="m">
        <table>
          <thead className="table-head">
            <tr>
                <th></th>
              <th >Name</th>
              <th >Min Diameter (km)</th>
              <th >Max Diameter (km)</th>
              <th >Orbiting Bodies</th>
            </tr>
          </thead>
          <tbody className="table-body">
            {filteredNeos.map((neo, index) => (
              <tr key={index} >
                <td>{index+1}.</td>
                <td>{neo.name}</td>
                <td >{neo.MinED.toFixed(2)}</td>
                <td >{neo.MaxED.toFixed(2)}</td>
                <td >{neo.orbiting_bodies.join(", ")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NEOsTable;
