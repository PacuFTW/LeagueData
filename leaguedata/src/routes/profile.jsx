import React, { useState } from "react";
import axios from "axios";

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

}

const ProfileData = ({ profile }) => {
    const [champions, setChampions] = useState(null);
    const [activeMode, setActiveMode] = useState(null);

    const handleFilterChampions = (mode) => {
        setActiveMode(mode)
        console.log("Filtering champions for mode:", mode);
    };

    return (
        <div className="text-white">
            <div className="bg-gray-700 p-6 rounded-lg shadow-lg">
                <div className="flex items-center mb-4">
                    <div className="mr-4">
                        <img src={"https://" + profile.icon} alt="Summoner Icon" className="w-20 h-20 rounded-full" />
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
                    <button className={`flex-1 px-4 py-2 rounded-lg ${activeMode === GameModes.ALL ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`} onClick={() => handleFilterChampions(GameModes.ALL)}>All</button>
                    <button className={`flex-1 px-4 py-2 rounded-lg ${activeMode === GameModes.SOLO ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`} onClick={() => handleFilterChampions(GameModes.SOLO)}>Solo</button>
                    <button className={`flex-1 px-4 py-2 rounded-lg ${activeMode === GameModes.FLEX ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`} onClick={() => handleFilterChampions(GameModes.FLEX)}>Flex</button>
                    <button className={`flex-1 px-4 py-2 rounded-lg ${activeMode === GameModes.ARAM ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`} onClick={() => handleFilterChampions(GameModes.ARAM)}>ARAM</button>
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
    const [topChamps, setTopChamps] = useState(null)

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
                console.log(response.data)
                setProfile(profiletemp);
            }).catch(e => {
                console.error(e);
            });
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
        </div>
    );
};

export default Profile;
