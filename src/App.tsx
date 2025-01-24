import { useState, useRef } from "react";
import { BalldontlieAPI } from "@balldontlie/sdk";

const API_KEY = import.meta.env.VITE_BALL_API_KEY;
const api = new BalldontlieAPI({ apiKey: API_KEY });

interface NBAPlayer {
    id: number;
    first_name: string;
    last_name: string;
}

interface NBATeam {
    id: number;
    full_name: string;
    abbreviation: string;
}

export default function App() {
    const [warning, setWarning] = useState("");
    const [error, setError] = useState();
    const [isLoading, setIsLoading] = useState(false);
    const [firstNameSearch, setFirstNameSearch] = useState("");
    const [lastNameSearch, setLastNameSearch] = useState("");
    const [players, setPlayers] = useState<NBAPlayer[]>([]);
    const [teams, setTeams] = useState<NBATeam[]>([]);
    const [searchType, setSearchType] = useState("");
    const [conference, setConference] = useState("");

    const abortControllerRef = useRef<AbortController | null>(null);

    const handleFirstNameSearchChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setFirstNameSearch(event.target.value);
    };

    const handleLastNameSearchChange = (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {
        setLastNameSearch(event.target.value);
    };

    const resetFields = () => {
        setFirstNameSearch("");
        setLastNameSearch("");
        setPlayers([]);
        setTeams([]);
        setWarning("");
        setSearchType("");
    };

    const handleNameSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!firstNameSearch && !lastNameSearch) return;

        abortControllerRef.current?.abort();
        abortControllerRef.current = new AbortController();

        setIsLoading(true);
        setPlayers([]);
        setWarning("No Results found");

        try {
            const players = await api.nba.getPlayers({
                first_name: firstNameSearch,
                last_name: lastNameSearch,
            });
            setPlayers(players.data);
        } catch (err: any) {
            if (err.name === "AbortError") {
                console.log("Aborted");
                return;
            }
            setError(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleTeamSubmit = async (event: React.FormEvent) => {
        event.preventDefault();
        if (!conference) return;
        abortControllerRef.current?.abort();
        abortControllerRef.current = new AbortController();

        setIsLoading(true);
        setTeams([]);
        setWarning("No Results found");

        try {
            const teams = await api.nba.getTeams({ conference: conference });
            setTeams(teams.data);
        } catch (err: any) {
            setError(err);
        } finally {
            setIsLoading(false);
        }
    };

    if (error) {
        return <p>Something went wrong!</p>;
    }

    return (
        <>
            <h1>Ball Don't Lie</h1>
            <label htmlFor="search-type">Search by: &nbsp;</label>
            <select name="search-type" id="search-type">
                <option
                    value=""
                    onClick={() => {
                        resetFields();
                    }}
                    defaultChecked
                >
                    Select an option...
                </option>
                <option
                    value="name"
                    onClick={() => {
                        setSearchType("name");
                    }}
                >
                    Name
                </option>
                <option
                    value="team"
                    onClick={() => {
                        setSearchType("team");
                    }}
                >
                    Team
                </option>
            </select>
            {searchType === "name" && (
                <form onSubmit={handleNameSubmit} onReset={resetFields}>
                    <input
                        type="text"
                        placeholder="First Name..."
                        value={firstNameSearch.trim()}
                        onChange={handleFirstNameSearchChange}
                    />
                    <input
                        type="text"
                        placeholder="Last Name..."
                        value={lastNameSearch.trim()}
                        onChange={handleLastNameSearchChange}
                    />
                    <button type="submit" value="submit">
                        Search
                    </button>
                    <button type="reset" value="reset">
                        Reset
                    </button>
                </form>
            )}
            {searchType === "team" && (
                <form onSubmit={handleTeamSubmit} onReset={resetFields}>
                    {/* <input
                        type="text"
                        placeholder="Team Name..."
                        value={teamSearch.trim()}
                        onChange={handleTeamSearchChange}
                    /> */}
                    <select name="conference" id="conference">
                        <option
                            value=""
                            onClick={() => {
                                setConference("");
                            }}
                            defaultChecked
                        >
                            Select an option...
                        </option>
                        <option
                            value="West"
                            onClick={() => {
                                setConference("West");
                            }}
                        >
                            West
                        </option>
                        <option
                            value="East"
                            onClick={() => {
                                setConference("East");
                            }}
                        >
                            East
                        </option>
                    </select>
                    <button type="submit" value="submit">
                        Search
                    </button>
                    <button type="reset" value="reset">
                        Reset
                    </button>
                </form>
            )}

            {isLoading && <p>Loading...</p>}
            {!isLoading && searchType === "name" && players.length === 0 && (
                <p>{warning}</p>
            )}
            {!isLoading && (
                <ul>
                    {players.map((player) => {
                        return (
                            <li key={player.id}>
                                ({player.id})&nbsp;
                                {player.first_name}&nbsp;
                                {player.last_name}
                            </li>
                        );
                    })}
                </ul>
            )}
            {!isLoading && searchType === "team" && teams.length === 0 && (
                <p>{warning}</p>
            )}
            {!isLoading && (
                <ul>
                    {teams.map((team) => {
                        return (
                            <li key={team.id}>
                                ({team.id})&nbsp;
                                {team.full_name}&nbsp;
                                {team.abbreviation}
                            </li>
                        );
                    })}
                </ul>
            )}
        </>
    );
}
