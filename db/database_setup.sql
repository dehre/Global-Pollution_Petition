DROP TABLE IF EXISTS user_profiles;
DROP TABLE IF EXISTS signatures;
DROP TABLE IF EXISTS petitions;
DROP TABLE IF EXISTS users;


CREATE TABLE users(
  id SERIAL PRIMARY KEY,
  first VARCHAR(200) NOT NULL,
  last VARCHAR(200) NOT NULL,
  email VARCHAR(300) UNIQUE NOT NULL,
  password VARCHAR(200) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


CREATE TABLE user_profiles(
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  age INTEGER,
  city VARCHAR(200),
  homepage VARCHAR(200)
);


CREATE TABLE petitions(
  id SERIAL PRIMARY KEY,
  owner_id INTEGER NOT NULL,
  name VARCHAR(200) NOT NULL,
  description VARCHAR(400) NOT NULL,
  goal INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);



CREATE TABLE signatures(
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  first VARCHAR(200) NOT NULL,
  last VARCHAR(200) NOT NULL,
  signature TEXT NOT NULL,
  petition_id INTEGER REFERENCES petitions(id),
  petition_goal INTEGER NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


INSERT INTO petitions (owner_id,name,description,goal) VALUES(1,'Pollution','WorldWide Campaign against Plastic Pollution in Oceans',15);
