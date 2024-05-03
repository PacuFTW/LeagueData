import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bounce, ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Plots = {
  Popularity_plot: 'get-pop-plot',
  Winrate_vs_Banrate: 'wr-vs-br',
  Winrate_heatmaps: 'wr-heatmaps',
  Average_Stats_radar: 'avg-stats-radar',
  Winrate_boxplot: 'wr-box',
  Correlation_Matrix: 'corr-mtx'
};

const ShowGraphs = () => {
  const [activePlot, setActivePlot] = useState(null);
  const [img, setImg] = useState('');

  useEffect(() => {
    console.log('idk')
  }, [img])

  const handleShowImage = (plot) => {
    if (plot == activePlot) {
      setImg(null);
      setActivePlot(null);
    }
    else {
      setActivePlot(plot)
      axios.get("http://localhost:2024/api/" + plot, { responseType: 'blob' }).then(response => {
        const imageUrl = URL.createObjectURL(response.data);
        setImg(imageUrl);
        toast.success('Successfully updated champions data for "' + plot + '" plot.')
      }).catch(e => {
        toast.error("Error getting data of " + plot + " plot.");
      })
    }
  };

  const handleClick = (event) => {
    event.preventDefault();

    window.open(event.target.src, '_blank', 'noopener,noreferrer')
  }

  return (
    <div>
      <div className="mt-4 bg-gray-700 p-6 rounded-lg shadow-lg">
        <div className="flex justify-between mb-4">
          <button className={`flex-1 px-4 py-2 mx-2 rounded-lg ${activePlot === Plots.Popularity_plot ? 'bg-indigo-800 text-white ring-2 ring-white' : 'bg-gray-200 hover:bg-gray-600 text-gray-700 hover:text-gray-200'}`} onClick={() => handleShowImage(Plots.Popularity_plot)}>Popularity plot</button>
          <button className={`flex-1 px-4 py-2 mx-2 rounded-lg ${activePlot === Plots.Winrate_vs_Banrate ? 'bg-indigo-800 text-white ring-2 ring-white' : 'bg-gray-200 hover:bg-gray-600 text-gray-700 hover:text-gray-200'}`} onClick={() => handleShowImage(Plots.Winrate_vs_Banrate)}>Winrate vs Banrate</button>
          <button className={`flex-1 px-4 py-2 mx-2 rounded-lg ${activePlot === Plots.Winrate_heatmaps ? 'bg-indigo-800 text-white ring-2 ring-white' : 'bg-gray-200 hover:bg-gray-600 text-gray-700 hover:text-gray-200'}`} onClick={() => handleShowImage(Plots.Winrate_heatmaps)}>Winrate heatmaps</button>
          <button className={`flex-1 px-4 py-2 mx-2 rounded-lg ${activePlot === Plots.Average_Stats_radar ? 'bg-indigo-800 text-white ring-2 ring-white' : 'bg-gray-200 hover:bg-gray-600 text-gray-700 hover:text-gray-200'}`} onClick={() => handleShowImage(Plots.Average_Stats_radar)}>Average stats</button>
          <button className={`flex-1 px-4 py-2 mx-2 rounded-lg ${activePlot === Plots.Winrate_boxplot ? 'bg-indigo-800 text-white ring-2 ring-white' : 'bg-gray-200 hover:bg-gray-600 text-gray-700 hover:text-gray-200'}`} onClick={() => handleShowImage(Plots.Winrate_boxplot)}>Winrate boxplot</button>
          <button className={`flex-1 px-4 py-2 mx-2 rounded-lg ${activePlot === Plots.Correlation_Matrix ? 'bg-indigo-800 text-white ring-2 ring-white' : 'bg-gray-200 hover:bg-gray-600 text-gray-700 hover:text-gray-200'}`} onClick={() => handleShowImage(Plots.Correlation_Matrix)}>Correlation Matrix</button>
        </div>
      </div>
      {activePlot && (<div className='flex justify-center'>
        <img src={img} alt="plot" onClick={handleClick} className='hover:cursor-pointer' />
      </div>)}
    </div>
  );
};

const Index = () => {
  const [selectedRank, setSelectedRank] = useState('');
  const [showGraphs, setShowGraphs] = useState(null);
  const ranks = ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Emerald', 'Diamond', 'Master', 'Grandmaster', 'Challenger'];

  const handleChange = (event) => {
    setSelectedRank(event.target.value);
  };

  const fetchData = async () => {
    axios.get(`http://localhost:2024/api/champion-data/${selectedRank.toLowerCase()}`).then(response => {
      setShowGraphs(true);
      toast.success('Successfully loaded champion data for: "' + selectedRank + '" rank.')
    }).catch(e => {
      toast.error("Something went wrong.");
    });
  };

  return (
    <div className="h-screen">
      <div className='flex items-center'>
        <select
          className="border border-gray-300 rounded p-2 mr-2 flex-1"
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
      </div>
      {showGraphs && <ShowGraphs />}
      <ToastContainer
        position="bottom-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss={false}
        draggable
        pauseOnHover={false}
        theme="dark"
      />
    </div>
  );
};

export default Index;
