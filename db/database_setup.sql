DROP TABLE IF EXISTS users;

CREATE TABLE users(
  id SERIAL PRIMARY KEY,
  first VARCHAR(200) NOT NULL,
  last VARCHAR(200) NOT NULL,
  email VARCHAR(300) UNIQUE NOT NULL,
  password VARCHAR(200) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


DROP TABLE IF EXISTS user_profiles;

CREATE TABLE user_profiles(
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  age INTEGER,
  city VARCHAR(200),
  homepage VARCHAR(200)
);


DROP TABLE IF EXISTS signatures;

CREATE TABLE signatures(
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  first VARCHAR(200) NOT NULL,
  last VARCHAR(200) NOT NULL,
  signature TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


DROP TABLE IF EXISTS petitions;

CREATE TABLE petitions(
  id SERIAL PRIMARY KEY,
  owner_id INTEGER NOT NULL,
  name VARCHAR(200) NOT NULL,
  description VARCHAR(400) NOT NULL,
  goal INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO petitions (owner_id,name,description,goal) VALUES(1,'Pollution','WorldWide Campaign against Plastic Pollution in Oceans',15);
