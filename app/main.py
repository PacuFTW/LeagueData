from fastapi import FastAPI
from fastapi.openapi.utils import get_openapi
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi import APIRouter
import requests
import re
from bs4 import BeautifulSoup
from enum import Enum

origins = ["*"]

app = FastAPI()
app.profileData = {}
app.championData = {}

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.get("/", response_class=HTMLResponse)
def read_root():
    return """
        <html>
            <head>
                <title>FastAPI with Swagger UI</title>
                <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist/swagger-ui.css" />
            </head>
            <body>
                <h1>FastAPI with Swagger UI</h1>
                <div id="swagger-ui"></div>

                <script src="https://unpkg.com/swagger-ui-dist/swagger-ui-bundle.js"></script>
                <script>
                    SwaggerUIBundle({
                        url: "/openapi.json",
                        dom_id: '#swagger-ui',
                    });
                </script>
            </body>
        </html>
    """

def open_profile_data(server,name,tagline):
    leagueofgraphs_url = f"https://www.leagueofgraphs.com/summoner/{server}/{name}-{tagline}"

    try:
        response = requests.get(leagueofgraphs_url, headers = {'User-Agent': 'Mozilla/5.0'})
        response.raise_for_status()

        soup = BeautifulSoup(response.text, 'html.parser')
        return soup

    except requests.exceptions.RequestException as e:
        print(f"Error fetching data: {e}")
        return {"error": f"Error fetching data: {e}"}
    
def open_champion_data(rank):
    if (rank == 'platinum' or rank == '' or rank == None):
        leagueofgraphs_url = f"https://www.leagueofgraphs.com/champions/builds/sr-ranked/by-champion-name"
    else: leagueofgraphs_url = f"https://www.leagueofgraphs.com/champions/builds/{rank}/sr-ranked/by-champion-name"

    try:
        response = requests.get(leagueofgraphs_url, headers = {'User-Agent': 'Mozilla/5.0'})
        response.raise_for_status()

        soup = BeautifulSoup(response.text, 'html.parser')
        return soup

    except requests.exceptions.RequestException as e:
        print(f"Error fetching data: {e}")
        return None

# Route for serving the OpenAPI schema
@app.get("/openapi.json")
def get_open_api_endpoint():
    return JSONResponse(get_openapi(title="FastAPI with Swagger UI", version="1.0", routes=app.routes))

# Additional routes for your API
router = APIRouter()

@router.get("/profile-data/{server}/{name}/{tagline}")
def get_profile_data(server: str, name: str, tagline: str):
    soup = open_profile_data(server,name,tagline)
    app.profileData = soup
    return {"message": "Data fetched successfully"}

@router.get("/profile-data")
def get_profile_data():
    return {f"data": str({app.profileData})}

@router.get("/level")
def get_level():
    try:
        level_element = app.profileData.find(class_='bannerSubtitle')
        level_helper = level_element.text.strip()
        level_helper_1 = re.sub(r'-.+', '', level_helper)
        level_helper_2 = re.findall(r'\d+', level_helper_1)
        return {"level": int(level_helper_2[0])}
    except Exception as e:
        print(f"Error fetching data: {e}")
        return {"error": f"Error fetching data: {e}"}

@router.get("/rank")
def get_rank():
    try:
        rank_element = app.profileData.find(class_='leagueTier')

        rank_helper = rank_element.text.strip()
        rank = re.sub(r'\s+', ' ', rank_helper) 

        return {"rank": rank}

    except Exception as e:
        print(f"Error fetching data: {e}")
        return {"error": f"Error fetching data: {e}"}

@router.get("/lp")
def get_lp():
    try:
        lp_element = app.profileData.find(class_='leaguePoints')

        lp_helper = lp_element.text.strip()
        lp = int(re.findall(r'\d+', lp_helper)[0])

        return {"lp": lp}

    except Exception as e:
        print(f"Error fetching data: {e}")
        return {"error": f"Error fetching data: {e}"}
    
@router.get("/winrate")
def get_winrate():
    try:
        wins_element = app.profileData.find(class_='winsNumber')
        losses_element = app.profileData.find(class_='lossesNumber')

        wins = int(wins_element.text.strip())
        losses = int(losses_element.text.strip())
        winrate = round((wins/(wins+losses))*100, 3)

        return {"losses": losses, "wins": wins, "winrate": winrate}

    except Exception as e:
        print(f"Error fetching data: {e}")
        return {"error": f"Error fetching data: {e}"}
    
@router.get("/ranking")
def get_ranking():
    try:
        rank_element = app.profileData.find(class_='rank')
        global_rank_element = rank_element.find(class_='highlight')
        regional_rank_element = rank_element.find(class_='regionalRank')
        top_rank_percentage_element = rank_element.find(class_='topRankPercentage')

        top_rank_percentage_helper = str(top_rank_percentage_element.string)
        global_rank_helper = str(global_rank_element.string)
        regional_rank_helper = re.findall(r'\d+(?:,\d+)?', regional_rank_element.string)[0]

        top_rank_percentage_number = float(re.findall(r'\d+(?:.\d+)?', top_rank_percentage_helper)[0])
        global_rank_number = re.sub(r',','', str(global_rank_helper))
        regional_rank_number = re.sub(r',','', regional_rank_helper)

        return {"globalrank": global_rank_number, "toprankpercentage": top_rank_percentage_number, "regionalrank": regional_rank_number}
    
    except Exception as e:
        print(f"Error fetching data: {e}")
        return {"error": f"Error fetching data: {e}"}
    
@router.get("/getProfile")
def get_profile():
    try:
        level_element = app.profileData.find(class_='bannerSubtitle')
        level_helper = level_element.text.strip()
        level_helper_1 = re.sub(r'-.+', '', level_helper)
        level = re.findall(r'\d+', level_helper_1)

        rank_element = app.profileData.find(class_='leagueTier')

        rank_helper = rank_element.text.strip()
        rank = re.sub(r'\s+', ' ', rank_helper) 

        lp_element = app.profileData.find(class_='leaguePoints')

        lp_helper = lp_element.text.strip()
        lp = int(re.findall(r'\d+', lp_helper)[0])

        wins_element = app.profileData.find(class_='winsNumber')
        losses_element = app.profileData.find(class_='lossesNumber')

        wins = int(wins_element.text.strip())
        losses = int(losses_element.text.strip())
        winrate = round((wins/(wins+losses))*100, 3)

        rank_element = app.profileData.find(class_='rank')
        global_rank_element = rank_element.find(class_='highlight')
        regional_rank_element = rank_element.find(class_='regionalRank')
        top_rank_percentage_element = rank_element.find(class_='topRankPercentage')

        top_rank_percentage_helper = str(top_rank_percentage_element.string)
        global_rank_helper = str(global_rank_element.string)
        regional_rank_helper = re.findall(r'\d+(?:,\d+)?', regional_rank_element.string)[0]

        top_rank_percentage_number = float(re.findall(r'\d+(?:.\d+)?', top_rank_percentage_helper)[0])
        global_rank_number = re.sub(r',','', str(global_rank_helper))
        regional_rank_number = re.sub(r',','', regional_rank_helper)

        return {"level": int(level[0]), 
                "rank": rank,
                "lp": lp,
                "losses": losses,
                "wins": wins,
                "winrate": winrate,
                "globalrank": global_rank_number,
                "toprankpercentage": top_rank_percentage_number,
                "regionalrank": regional_rank_number
            }
    
    except Exception as e:
        print(f"Error fetching data: {e}")
        return {"error": f"Error fetching data: {e}"}



class QueueType(str, Enum):
    all = "all"
    solo = "solo"
    flex = "flex"
    aram = "aram"
    
@router.get("/all-played")
def get_all_played(queue: QueueType):
    try:
        champions_container = app.profileData.find_all(class_='tabs-content')[1] #gives back the champions content box

        if (queue == QueueType.all):
            tr_elements = champions_container.find_all_next(class_="content")[0].find_next('table').find_all_next('tr')[1:11] #gives back the top 10 all queue champions of account
        if (queue == QueueType.solo):
            tr_elements = champions_container.find_all_next(class_="content")[1].find_next('table').find_all_next('tr')[1:11] #gives back the top 10 soloqueue champions of account
        if (queue == QueueType.flex):
            tr_elements = champions_container.find_all_next(class_="content")[2].find_next('table').find_all_next('tr')[1:11] #gives back the top 10 flex champions of account
        # note to self: ez itt nem jó
        if (queue == QueueType.aram):
            tr_elements = champions_container.find_all_next(class_="content")[4].find_next('table').find_all_next('tr')[1:11] #gives back the top 10 aram champions of account

        champions_dictionary = {}

        i = 0
        for el in tr_elements:
            champion_dict = {}
            champion = el.find('td').find_next('div').find_next(class_='txt')

            champion_dict['name'] = champion.find(class_='name').string

            if (champion.find(class_='top-rank') == None):
                champion_dict['top_rank'] = None
                champion_dict['regional_rank'] = None
            else:
                champion_dict['top_rank'] = champion.find(class_='top-rank').string
                champion_dict['regional_rank'] = champion.find(class_='regionalRank').string
            
            champion_dict['kills'] = champion.find(class_='kills').string
            champion_dict['deaths'] = champion.find(class_='deaths').string
            champion_dict['assists'] = champion.find(class_='assists').string

            champions_dictionary[i] = champion_dict
            i += 1
        return {"data": champions_dictionary}
    
    except Exception as e:
        print(f"Error fetching data: {e}")
        return {"error": f"Error fetching data: {e}"}
    
class RankType(str, Enum):
    iron = "iron"
    bronze = "bronze"
    silver = "silver"
    gold = "gold"
    platinum = "platinum"
    emerald = "emerald"
    diamond = "diamond"
    master = "master"
    grandmaster = "grandmaster"
    challenger = "challenger"
    
@router.get("/champion-data/{rank}")
def get_champion_data(rank: RankType):
    try:
        soup = open_champion_data(rank)
        app.championData = soup

        app.championData.find_all(class_='hide-for-dark')

        tr_elements_champs = app.championData.find(id='mainContent').find_next('div').find_next('div').find_next('div').find_next('table').find_all_next('tr')[1:180]

        champions_stats = {}
        tr_elements_champs

        i = 0
        for el in tr_elements_champs:
            if (i != 8 and i % 16 != 0 or i == 0): 
                cur_champ_data = {}
                champion = el.find('td')

                cur_champ_data['name'] = re.sub(r'\s+', '', champion.find_next(class_='name').string)

                cur_champ_data['popularity'] = round(float(champion.find_all_next('progressbar')[0]['data-value'])*100,2)
                cur_champ_data['winrate'] = round(float(champion.find_all_next('progressbar')[1]['data-value'])*100,2)
                cur_champ_data['banrate'] = round(float(champion.find_all_next('progressbar')[2]['data-value'])*100,2)

                cur_champ_data['avg.kills'] = float(champion.find_next(class_='kills').string)
                cur_champ_data['avg.deaths'] = float(champion.find_next(class_='deaths').string)
                cur_champ_data['avg.assists'] = float(champion.find_next(class_='assists').string)

                champions_stats[i] = cur_champ_data
            i += 1    

        return {"data": champions_stats}
    
    except Exception as e:
        print(f"Error fetching data: {e}")
        return {"error": f"Error fetching data: {e}"}
    
app.include_router(router, prefix="/api")

# Serve static files (e.g., the Swagger UI) from the '/static' directory
app.mount("/static", StaticFiles(directory="/app/static"), name="static")
