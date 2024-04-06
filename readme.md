# Basic FastAPI

A basic FastAPI for later usage.

## Table of Contents

- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Running the Application](#running-the-application)
- [Writing a New API](#writing-a-new-api)
- [How will it looks like](#how-will-it-looks-like)

## Getting Started

These instructions will guide you through setting up the project on your local machine.

### Prerequisites

- Docker installed on your system. You can download it from [Docker's official website](https://www.docker.com/).

### Installation

1. Clone the repository to your local machine:

```git clone https://github.com/your-username/your-repo.git```

2. Move to the folder

```cd your-repo```

3. Start the docker

```docker-compose up --build```

4. Take a look at the result:

Open a browser and insert:
```[your_ip]:8000```

### Running the application
If you want to run it in the background you can use ```-d``` flag:
```docker-compose up --build -d```

### Writing a new API
```
@app.get("/your_endpoint/")
def your_api_function():
    # Your API logic here
    return {"message": "Hello from your new API!"}
```

If you want to get parameters from the request:
```
@app.get("/your_endpoint/{Value}")
def your_api_function(Value):
    #Then you can use Value parameter in your program
    # Your API logic here
    return {"message": "Hello from your new API!"}
```

Other solution:

```
#Define a class for the datas that you want to get.
class Item(BaseModel):
    value1: str
    value2: bool
    value3: str = None

@app.get("/your_endpoint/")
def your_api_function(item:Item):
    #Then you can use item.value1, item.value2 and item.value3 as parameter in your program
    # Your API logic here
    return {"message": "Hello from your new API!"}
```

### How will it looks like
![Email sender](images/email_sender.PNG)

![OPC-UA_API](images/OPCUA.PNG)

