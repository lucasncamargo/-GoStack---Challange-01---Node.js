const express = require("express");
const cors = require("cors");

const { uuid, isUuid } = require("uuidv4");

const app = express();

app.use(express.json());
app.use(cors());

const repositories = [];

function findRepository(id) {
  if (!isUuid(id)) {
    return { 
      error: 'Repository ID is invalid.', 
      index: null,
    };
  }
  const index = repositories.findIndex((repo) => repo.id === id);
  if (index < 0) {
    return { 
      error: 'Repository not found.', 
      index: null,
    };
  }
  return { error: null, index };
}

app.get("/repositories", (request, response) => {
  return response.status(200).json(repositories);
});

app.post("/repositories", (request, response) => {
  const { title, url, techs } = request.body;

  if (!title) {
    return response.status(400).json({ error: 'Repository title is required.' });
  }
  if (!url) {
    return response.status(400).json({ error: 'Repository url is required.' });
  }
  if (techs && !Array.isArray(techs)) {
    return response.status(400).json({ error: 'Techs of repository are expected as list format.' });
  }

  const repository = {
    id: uuid(),
    title,
    url,
    techs: techs || [],
    likes: 0,
  };

  repositories.push(repository);
  return response.status(200).json(repository);
});

app.put("/repositories/:id", (request, response) => {
  const { id } = request.params;
  const { title, url, techs } = request.body;

  const repository = findRepository(id);

  if (repository.error) {
    return response.status(400).json(repository.error);
  }

  if (techs && !Array.isArray(techs)) {
    return response.status(400).json({ error: 'Techs of repository are expected as list format.' });
  }

  const repoIndex = repository.index;
  
  if (title) {
    repositories[repoIndex].title = title;
  }
  if (url) {
    repositories[repoIndex].url = url;
  }
  if (techs) {
    repositories[repoIndex].techs = techs;
  }

  return response.status(200).json(repositories[repoIndex]);
});

app.delete("/repositories/:id", (request, response) => {
  const { id } = request.params;

  const repository = findRepository(id);

  if (repository.error) {
    return response.status(400).json(repository.error);
  }

  repositories.splice(repository.index, 1);
  return response.status(204).send();
});

app.post("/repositories/:id/like", (request, response) => {
  const { id } = request.params;

  const repository = findRepository(id);

  if (repository.error) {
    return response.status(400).json(repository.error);
  }
  
  const repoIndex = repository.index;
  repositories[repoIndex].likes = repositories[repoIndex].likes + 1;

  return response.status(200).json(repositories[repoIndex])
});

module.exports = app;
