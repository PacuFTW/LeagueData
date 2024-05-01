from fastapi import FastAPI, HTTPException, BackgroundTasks, Response
from fastapi.openapi.utils import get_openapi
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi import APIRouter
import requests
import io
import re
from bs4 import BeautifulSoup
from enum import Enum
import matplotlib.pyplot as plt
import seaborn as sns
import pandas as pd


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

        rank_wo_div = rank.split()[0]
        if(rank_wo_div == "Iron"): rank_num = 1
        elif (rank_wo_div == "Bronze"): rank_num = 2
        elif (rank_wo_div == "Silver"): rank_num = 3
        elif (rank_wo_div == "Gold"): rank_num = 4
        elif (rank_wo_div == "Platinum"): rank_num = 5
        elif (rank_wo_div == "Emerald"): rank_num = 6
        elif (rank_wo_div == "Diamond"): rank_num = 7
        elif (rank_wo_div == "Master"): rank_num = 8
        elif (rank_wo_div == "GrandMaster"): rank_num = 9
        elif (rank_wo_div == "Challenger"): rank_num = 10

        icon_element = app.profileData.find(class_='img').find_next('img')
        icon = re.search(r'.*?(\d+\.png)',icon_element['src'])
        icon = icon.group(1)

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
                "icon": icon,
                "rank": rank,
                "rankicon": rank_num,
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
        raise HTTPException(status_code=478, detail="Error getting data!")



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
        raise HTTPException(status_code=478, detail="Error getting data!")
    
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

                name = re.sub(r'\s+', '', champion.find_next(class_='name').string)

                cur_champ_data['popularity'] = round(float(champion.find_all_next('progressbar')[0]['data-value'])*100,2)
                cur_champ_data['winrate'] = round(float(champion.find_all_next('progressbar')[1]['data-value'])*100,2)
                cur_champ_data['banrate'] = round(float(champion.find_all_next('progressbar')[2]['data-value'])*100,2)

                cur_champ_data['avg.kills'] = float(champion.find_next(class_='kills').string)
                cur_champ_data['avg.deaths'] = float(champion.find_next(class_='deaths').string)
                cur_champ_data['avg.assists'] = float(champion.find_next(class_='assists').string)

                champions_stats[name] = cur_champ_data
            i += 1    
            
        df = pd.DataFrame.from_dict(champions_stats, orient='index')
        app.champion_data = df
        return {"Champion data loaded"}
    
    except Exception as e:
        print(f"Error fetching data: {e}")
        return {"error": f"Error fetching data: {e}"}
    
def make_pop_plot(data):
    fig = plt.figure(figsize=(10,6))
    sns.barplot(y=data.index, x=data.values, palette='viridis')
    plt.xlabel('Popularity')
    plt.ylabel('Champion')
    plt.title('Top 10 Champions by Popularity')
    img_buf = io.BytesIO()
    plt.savefig(img_buf, format='png')
    plt.close(fig)
    return img_buf

@router.get("/get-pop-plot")
def get_pop_plot(background_tasks: BackgroundTasks):
    top_10_popular_champions = app.champion_data['popularity'].nlargest(10)

    pop_bar = make_pop_plot(top_10_popular_champions)
    background_tasks.add_task(pop_bar.close)
    return Response(pop_bar.getvalue(), headers={'Content-Disposition': 'inline; filename="out.png"'}, media_type='image/png')

def make_wr_vs_br_graph(data):
    custom_palette = sns.color_palette("coolwarm", as_cmap=True)

    fig = plt.figure(figsize=(15,15))
    sns.scatterplot(x='winrate', y='banrate', size='popularity', sizes=(100, 400), data=data, palette=custom_palette, edgecolor='black', alpha=0.8)

    for champ, (winrate, banrate) in data[['winrate', 'banrate']].iterrows():
        plt.text(winrate, banrate, champ, fontsize=9, ha='right', va='center', color='black')

    plt.xlabel('Win Rate', fontsize=12)
    plt.ylabel('Ban Rate', fontsize=12)
    plt.title('Win Rate vs. Ban Rate', fontsize=14)
    plt.xticks(fontsize=10)
    plt.yticks(fontsize=10)
    plt.grid(True, linestyle='--', alpha=0.5)
    plt.tight_layout()
    img_buf = io.BytesIO()
    plt.savefig(img_buf, format='png')
    plt.close(fig)
    return img_buf


@router.get("/wr-vs-br")
def get_wr_vs_br_graph(background_tasks: BackgroundTasks):
    champion_data = app.champion_data
    
    wr_vs_br_graph = make_wr_vs_br_graph(champion_data)
    background_tasks.add_task(wr_vs_br_graph.close)
    return Response(wr_vs_br_graph.getvalue(), headers={'Content-Disposition': 'inline; filename="out.png"'}, media_type='image/png')

def make_wr_heatmaps(data):
    win_rate_bins = [0, 44, 46, 48, 50, 52, 54, 56, 58, 100]
    win_rate_labels = ['<44%','44-46%', '46-48%', '48-50%', '50-52%', '52-54%', '54-56%', '56-58%', '>58%']

    data['win_rate_range'] = pd.cut(data['winrate'], bins=win_rate_bins, labels=win_rate_labels)

    win_rate_heatmap = data.groupby('win_rate_range').size().reset_index(name='count').pivot(columns='win_rate_range', values='count')

    fig = plt.figure(figsize=(10,6))
    sns.heatmap(win_rate_heatmap, cmap='viridis', annot=True, fmt='.0f')
    plt.xlabel('Win Rate Range')
    plt.ylabel('Champion Count')
    plt.title('Win Rate Distribution')
    img_buf = io.BytesIO()
    plt.savefig(img_buf, format='png')
    plt.close(fig)
    return img_buf


@router.get("/wr-heatmaps")
def get_wr_heatmaps(background_tasks: BackgroundTasks):
    champion_data = app.champion_data
    
    wr_heatmaps = make_wr_heatmaps(champion_data)
    background_tasks.add_task(wr_heatmaps.close)
    return Response(wr_heatmaps.getvalue(), headers={'Content-Disposition': 'inline; filename="out.png"'}, media_type='image/png')

def make_avg_stats_radar(data):
    stats_df = data[['avg.kills', 'avg.deaths', 'avg.assists']]
    stats_df['Champion'] = stats_df.index

    fig = plt.figure(figsize=(35,10))
    sns.lineplot(data=stats_df, dashes=False, palette='viridis')
    plt.title('Average Stats Radar Chart')
    plt.legend(title='Stats')

    plt.xticks(rotation=90, ha='center')

    img_buf = io.BytesIO()
    plt.savefig(img_buf, format='png')
    plt.close(fig)
    return img_buf


@router.get("/avg-stats-radar")
def get_avg_stats_radar(background_tasks: BackgroundTasks):
    champion_data = app.champion_data
    
    avg_stats_radar = make_avg_stats_radar(champion_data)
    background_tasks.add_task(avg_stats_radar.close)
    return Response(avg_stats_radar.getvalue(), headers={'Content-Disposition': 'inline; filename="out.png"'}, media_type='image/png')

def make_wr_box(data):
    fig = plt.figure(figsize=(10,6))
    sns.boxplot(y=data['winrate'], orient='v', color='skyblue', linewidth=2.5, width=0.4)

    plt.axhline(y=data['winrate'].median(), color='red', linestyle='--', linewidth=2)

    plt.ylabel('Win Rate', fontsize=12)
    plt.title('Box Plot of Win Rates', fontsize=14)
    plt.xticks(fontsize=10)
    plt.yticks(fontsize=10)
    plt.grid(True, linestyle='--', alpha=0.5)
    plt.tight_layout()
    img_buf = io.BytesIO()
    plt.savefig(img_buf, format='png')
    plt.close(fig)
    return img_buf


@router.get("/wr-box")
def get_wr_box(background_tasks: BackgroundTasks):
    champion_data = app.champion_data
    
    wr_box = make_wr_box(champion_data)
    background_tasks.add_task(wr_box.close)
    return Response(wr_box.getvalue(), headers={'Content-Disposition': 'inline; filename="out.png"'}, media_type='image/png')

def make_corr_mtx(data):
    df_numeric = data[['popularity', 'winrate', 'banrate', 'avg.kills', 'avg.deaths', 'avg.assists']]
    fig = plt.figure(figsize=(10,6))
    sns.heatmap(df_numeric.corr(), annot=True, cmap='viridis')
    plt.title('Correlation Matrix of Champion Statistics')
    plt.show()
    img_buf = io.BytesIO()
    plt.savefig(img_buf, format='png')
    plt.close(fig)
    return img_buf


@router.get("/corr-mtx")
def get_corr_mtx(background_tasks: BackgroundTasks):
    champion_data = app.champion_data
    
    corr_mtx = make_corr_mtx(champion_data)
    background_tasks.add_task(corr_mtx.close)
    return Response(corr_mtx.getvalue(), headers={'Content-Disposition': 'inline; filename="out.png"'}, media_type='image/png')



app.include_router(router, prefix="/api")

# Serve static files (e.g., the Swagger UI) from the '/static' directory
app.mount("/static", StaticFiles(directory="/app/static"), name="static")
