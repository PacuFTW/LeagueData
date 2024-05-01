import React, { useState } from "react";
import axios from "axios";
import { Bounce, ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const LolServer = {
    NA: "na",
    EUW: "euw",
    EUNE: "eune",
    BR: "br",
    KR: "kr",
    SG: "sg",
    TR: "tr",
    VN: "vn",
    LAS: "las",
    LAN: "lan",
    OE: "oce",
    RU: "ru",
    PH: "ph",
    TW: "tw",
    TH: "th"
};

const GameModes = {
    ALL: 'all',
    SOLO: 'solo',
    FLEX: 'flex',
    ARAM: 'aram'
};

const Champions = ({ champions }) => {
    return (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-white">
            {Object.values(champions).map((champion, index) => (
                <div key={index} className="border rounded-lg p-4 bg-gray-800 relative">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold mb-2">{champion.name}</h2>
                        <img src={"https://static.bigbrain.gg/assets/lol/riot_static/14.8.1/img/champion/" + champion.name + ".png"} alt={champion.name} className="h-16 w-16 mr-2" />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                        <div>
                            <p className="text-gray-200 font-bold">Top Rank:</p>
                            <p className="italic">{champion.top_rank ? champion.top_rank : 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-gray-200 font-bold">Regional Rank:</p>
                            <p className="italic">{champion.regional_rank ? champion.regional_rank : 'N/A'}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-2">
                        <div>
                            <p className="text-gray-200 font-bold">Kills:</p>
                            <p className="italic text-blue-400">{champion.kills}</p>
                        </div>
                        <div>
                            <p className="text-gray-200 font-bold">Deaths:</p>
                            <p className="italic text-red-500">{champion.deaths}</p>
                        </div>
                        <div>
                            <p className="text-gray-200 font-bold">Assists:</p>
                            <p className="italic text-yellow-300">{champion.assists}</p>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

}

const ProfileData = ({ profile }) => {
    const [champions, setChampions] = useState(null);
    const [activeMode, setActiveMode] = useState(null);

    const handleFilterChampions = (mode) => {
        if (mode == activeMode) {
            setChampions(null);
            setActiveMode(null);
        }
        else {
            setActiveMode(mode)
            axios.get("http://localhost:2024/api/all-played?queue=" + mode).then(response => {
                setChampions(response.data.data)
                toast.success('Successfully updated champions data for "' + mode + '" queue.')
            }).catch(e => {
                toast.error("Error getting data of " + mode + " queue.");
            })
        }
    };

    return (
        <div className="text-white">
            <div className="flex justify-between items-center bg-gray-700 px-10 py-1 rounded-lg shadow-lg">
                <div className="flex items-center">
                    <div className="mr-4">
                        <img src={"https://static.bigbrain.gg/assets/lol/riot_static/14.8.1/img/profileicon/" + profile.icon} alt="Summoner Icon" className="w-32 h-32 rounded-full" />
                    </div>
                    <div className="flex items-start gap-3">
                        <div>
                            <h2 className="text-2xl font-bold mb-1"><span>{profile.name}</span></h2>
                            <p className="text-lg"><span>#{profile.tagline}</span></p>
                        </div>
                        <div className="mt-2">
                            <p className="text-md italic">{profile.server.toUpperCase()}</p>
                        </div>
                    </div>
                </div>
                <div className="flex items-center">
                    <img src={"https://lolg-cdn.porofessor.gg/img/s/league-icons-v3/160/" + profile.rankicon + ".png?v=9"} alt={profile.rank} className="w-40 h-40 mr-2" />
                    <div className="flex flex-col">
                        <p className="text-lg"><span className="font-bold">Rank:</span> {profile.rank}</p>
                        <p className="text-lg"><span className="font-bold">LP:</span> {profile.lp}</p>
                        <p className="text-lg"><span className="font-bold">Wins:</span> {profile.wins}</p>
                        <p className="text-lg"><span className="font-bold">Losses:</span> {profile.losses}</p>
                        <p className="text-lg"><span className="font-bold">Winrate:</span> {profile.winrate}%</p>
                    </div>
                    <div className="ml-4">
                        <h2 className="text-2xl font-bold mb-2">Rankings</h2>
                        <p className="text-lg"><span className="font-bold">Global Rank:</span> {profile.globalrank}</p>
                        <p className="text-lg"><span className="font-bold">Top Ranking Percentage:</span> Top {profile.toprankpercentage} %</p>
                        <p className="text-lg"><span className="font-bold">Regional Rank:</span> {profile.regionalrank}</p>
                    </div>
                </div>
            </div>
            <div className="mt-4 bg-gray-700 p-6 rounded-lg shadow-lg">
                <div className="flex justify-between mb-4">
                    <button className={`flex-1 px-4 py-2 mx-2 rounded-lg ${activeMode === GameModes.ALL ? 'bg-indigo-800 text-white ring-2 ring-white' : 'bg-gray-200 text-gray-700'}`} onClick={() => handleFilterChampions(GameModes.ALL)}>All</button>
                    <button className={`flex-1 px-4 py-2 mx-2 rounded-lg ${activeMode === GameModes.SOLO ? 'bg-indigo-800 text-white ring-2 ring-white' : 'bg-gray-200 text-gray-700'}`} onClick={() => handleFilterChampions(GameModes.SOLO)}>Solo</button>
                    <button className={`flex-1 px-4 py-2 mx-2 rounded-lg ${activeMode === GameModes.FLEX ? 'bg-indigo-800 text-white ring-2 ring-white' : 'bg-gray-200 text-gray-700'}`} onClick={() => handleFilterChampions(GameModes.FLEX)}>Flex</button>
                    <button className={`flex-1 px-4 py-2 mx-2 rounded-lg ${activeMode === GameModes.ARAM ? 'bg-indigo-800 text-white ring-2 ring-white' : 'bg-gray-200 text-gray-700'}`} onClick={() => handleFilterChampions(GameModes.ARAM)}>ARAM</button>
                </div>
                {champions && <Champions champions={champions} />}
            </div>
        </div >
    );

};

const Profile = () => {
    const [tagline, setTagline] = useState("");
    const [server, setServer] = useState(LolServer.EUW);
    const [username, setUsername] = useState("");
    const [profile, setProfile] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        let profiletemp = {};
        profiletemp.name = username;
        profiletemp.tagline = tagline;
        profiletemp.server = server;
        axios.get("http://localhost:2024/api/profile-data/" + server + "/" + username + "/" + tagline,).then(response => {
            axios.get("http://localhost:2024/api/getProfile").then(response => {
                profiletemp.rank = response.data.rank;
                profiletemp.icon = response.data.icon;
                profiletemp.rankicon = response.data.rankicon;
                profiletemp.lp = response.data.lp;
                profiletemp.level = response.data.level;
                profiletemp.wins = response.data.wins;
                profiletemp.losses = response.data.losses;
                profiletemp.winrate = response.data.winrate;
                profiletemp.globalrank = response.data.globalrank;
                profiletemp.toprankpercentage = response.data.toprankpercentage;
                profiletemp.regionalrank = response.data.regionalrank;
                setProfile(profiletemp);
            }).catch(e => {
                toast.error(e);
            });
        }).catch(e => {
            toast.error("Error getting profile data!");
        });

    };

    return (
        <div className="container mx-auto mt-8">
            {!profile && (
                <>
                    <h1 className="text-2xl text-white font-bold mb-4">Enter Riot Games ID Tagline, Server, and League Username</h1>
                    <form onSubmit={handleSubmit}>
                        <div className="mb-4 grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-gray-200 text-sm font-bold mb-2">League Username:</label>
                                <input
                                    type="text"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                />
                            </div>
                            <div>
                                <label className="block text-gray-200 text-sm font-bold mb-2">Tagline:</label>
                                <input
                                    type="text"
                                    value={tagline}
                                    onChange={(e) => setTagline(e.target.value)}
                                    className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                />
                            </div>
                        </div>
                        <div className="mb-4">
                            <label className="block text-gray-200 text-sm font-bold mb-2">Server:</label>
                            <select
                                value={server}
                                onChange={(e) => setServer(e.target.value)}
                                className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            >
                                {Object.keys(LolServer).map((key) => (
                                    <option key={key} value={LolServer[key]}>
                                        {key}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button type="submit" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded w-full focus:outline-none focus:shadow-outline">
                            Submit
                        </button>
                    </form>
                </>
            )}
            {profile && <ProfileData profile={profile} />}
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

export default Profile;
