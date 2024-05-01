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

// Component to display profile data
const ProfileData = ({ profile }) => {
    return (
        <div>
            <h2>Profile Data</h2>
            <p>Summoner Name: {profile.name}</p>
            <p>Summoner Level: {profile.level}</p>
            <p>Summoner Rank: {profile.rank}</p>
            {/* Add more profile data fields here */}
        </div>
    );
};

// Main component
const Profile = () => {
    // State for form inputs
    const [tagline, setTagline] = useState("");
    const [server, setServer] = useState(LolServer.EUW);
    const [username, setUsername] = useState("");
    // State for profile data
    const [profile, setProfile] = useState(null);
    const [topChamps, setTopChampts] = useState(null)

    // Function to handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        let profiletemp = {};
        profiletemp.name = username;
        profiletemp.tagline = tagline;
        profiletemp.server = server;
        axios.get("http://localhost:2024/api/profile-data/" + server + "/" + username + "/" + tagline,).then(response => {
            axios.get("http://localhost:2024/api/getProfile").then(response => {
                if (response.data.error != undefined) console.error(response.data.error);
                else {
                    profiletemp.rank = response.data.rank;
                    profiletemp.lp = response.data.lp;
                    profiletemp.level = response.data.level;
                    profiletemp.wins = response.data.wins;
                    profiletemp.losses = response.data.losses;
                    profiletemp.winrate = response.data.winrate;
                    profiletemp.globalrank = response.data.globalrank;
                    profiletemp.toprankingpercentage = response.data.toprankingpercentage;
                    profiletemp.regionalrank = response.data.regionalrank;
                    setProfile(profiletemp);
                }
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
                            <label className="block text-gray-700 text-sm font-bold mb-2">Server:</label>
                            <select
                                value={server}
                                onChange={(e) => setServer(e.target.value)}
                                className="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                            >
                                {/* Generate options for server selection */}
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
