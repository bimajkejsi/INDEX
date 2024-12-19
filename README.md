<img src="./spotify/src/logo.jpg" width="250px">

# Index

## Project Description
This project combines advanced analytics and AI to build a smart music search system integrated with data insights and RDF-based ontology design. It aims to offer both visualizations of Spotify data and a search system powered by artificial intelligence for an enhanced user experience.

## Group Members

| Surname      | Name      |
| ------------ | --------- |
| Niknam Hesar | Sara      |
| Bimaj        | Kejsi     |
| Tikhonov     | Vladislav |

---

## Organisation of the Repository

The repository is organized as follows:

### 1. `index`
This folder contains the source code of the developed project.

- **`dataset`**:
  - **`rdf`**: Contains RDF files for semantic web integration.
  - **`ttl files.zip`**: Contains the converted data into RDF files.
  - **`chart.csv`**: The original dataset file.
  - **`cleaned_chart.csv`**: The selected dataset file for project implementation.

---

### 2. `ontology`
This folder contains the ontology and related files.
- **`Spotify.ttl`**: General ontology file implemented with Protege.

- **Additional Notes**:
  - The ontology file can be used with other datasets for expanding semantic search functionalities.
  - Consider integrating it with visualization tools for better exploration of ontology relationships.

---

### 3. `interface`
This folder includes the interactive user interface files.

- **Files**:
  - **`index.html`**: Front-end interface for user interaction with the music search system.
  - **`rdfParser.js`**: Parses RDF data to extract entities and relationships for semantic querying.
  - **`server.js`**: Sets up the backend server using Node.js and Express. Handles:
    - API requests.
    - Routing.
    - Integration with OpenAI API and Fuse.js for search functionality.
  - **`songs_with_artists.json`**: Maps songs to artists with metadata for search.

---

### 4. `src`
This folder contains image files used in the project.

- **Additional Notes**:
  - Images include the project logo, used across the interface for branding.


---

## How to Run and Use the Code

1. **Install Required Packages**  
   Run the following commands in your terminal to install the necessary dependencies:
   ```bash
   npm install express
   npm install cors
   npm install openai
   npm install fuse.js
   npm install sweetalert2

2. **Start the Server**
   
     Navigate to the interface directory and run the following command:
   ```bash
   cd interface
   node server.js
   
  This command will start the backend server required for the application.

3. **Access the Application**

Once the server is running, open your web browser and visit: http://127.0.0.1:3000
Here, you can interact with the music search system, explore analytical insights, and perform searches.

5. **Important Notes**

* Ensure you have an OpenAI API key to use this project.
* Set up your API key in the appropriate configuration file or environment variable before running the application.

