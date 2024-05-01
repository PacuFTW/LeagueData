import React, { useState } from 'react';
import axios from 'axios';

const Index = () => {
  const [selectedRank, setSelectedRank] = useState('');
  const [userData, setUserData] = useState(null);
  const ranks = ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Master', 'Grandmaster', 'Challenger'];

  const handleChange = (event) => {
    setSelectedRank(event.target.value);
  };

  const fetchData = async () => {
    axios.get(`http://localhost:2024/api/champion-data/${selectedRank.toLowerCase()}`).then(response=>{
      setUserData(response.data);
    }).catch(e =>{
      console.error(e);
    });
  };

  const UserDataComponent = ({ userData }) => {
    return (
      <div>
        <p>randombullshit</p>
      </div>
    );
  };

  return (
    <div className="h-screen">
      <select
        className="border border-gray-300 rounded p-2 mr-2"
        value={selectedRank}
        onChange={handleChange}
      >
        <option value="">Select Rank</option>
        {ranks.map((rank, index) => (
          <option key={index} value={rank}>{rank}</option>
        ))}
      </select>
      <button
        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        onClick={fetchData}
      >
        Get Data
      </button>
      {userData && <UserDataComponent userData={userData} />}
    </div>
  );
};

export default Index;
