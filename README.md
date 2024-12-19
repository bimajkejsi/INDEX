<img src="spotify/src/logo.jpg" width="250px">
#Index
## Project Description ##
This project combines advanced analytics and AI to build a smart music search system integrated with data insights and RDF-based ontology design. It aims to offer both visualizations of Spotify data and a search system powered by artificial intelligence for an enhanced user experience.
## Group members

| Surname      | Name      |
| ------------ | --------- |
| Niknam Hesar | Sara      |
| Bimaj        | Kejsi     |
| Tikhonov     | Vladislav |

## Organisation of the repository

The repository is organised as follows:

- `index`: This folder contains the source code of the developed project.

  - `dataset` :
    _ `rdf`
    _ `ttl files.zip` : Contains the converted data into RDF files for semantic web integration.
    _ `chart.csv` : the original dataset file
    _ `cleaned_chart.csv` : The selected dataset file for implelemnting project based on it.

- `ontology`:Contains the ontology file which implemented with Protege also the interface
  \_ `Spotify.ttl` : General ontology file which implemented with Protege
  - `interface` :Interactive User Interface
    _ `index.html`: It provides a front-end interface for users to interact with the music search system and explore the analytical insights generated by the backend
    _ `rdfParser.js`: The rdfParser.js script parses RDF data, extracting entities and relationships to enable semantic querying and integration into the system.
    _`server.js`: The server.js script sets up the backend server using Node.js and Express, handling API requests, routing, and integration with the OpenAI API and Fuse.js for the music search functionality
    _`songs_with_artists.json` : maps songs to artists with metadata for search.
- `src`:Contains the image file .

## How to run and use the codes?

1. Install Required Packages: Run the following commands in your terminal to install the necessary dependencies:
   npm install express
   npm install cors
   npm install openai
   npm install fuse.js
   npm install sweetalert2
2. Start the Server Navigate to the interface directory and run the following:
   cd interface
   node server.js
3. Access the Application Open your web browser and visit:
   http://127.0.0.1:3000
4. Important Notes

- Ensure you have an OpenAI API key to use this project.
- Set up your API key in the appropriate configuration file or environment variable.
