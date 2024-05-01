import React, { useState } from "react";
import axios from "axios";

const LolServer = {
    NA: "na",
    EUW: "euw",
    EUNE: "eune",
    // Add more servers as needed
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

    // Function to handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        let profiletemp = {};
        profiletemp.name = username;
        axios.get("http://localhost:2024/api/profile-data/" + server + "/" + username + "/" + tagline,).then(response => {
            axios.all([
                axios.get("http://localhost:2024/api/rank"),
                axios.get("http://localhost:2024/api/lp"),
                axios.get("http://localhost:2024/api/level"),
            ]).then(axios.spread((rank,lp, level) => {
                console.log('rank:', rank.data.rank,', lp', lp.data.lp, ', level', level.data.level)
              }));
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
