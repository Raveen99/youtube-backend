# SetUp

-   installing nodemon
-   setting type as module in package.json
-   adding gitignore file and generate it from online gitignore generator
-   installing prettier
-   making prettierignore file
-   creating env file
-   creating necessary folder structure in src

# SetUp mongo atlas

-   create account on mongo atlas
-   create project and set up access database user and access
-   create network access, set ip - 0.0.0.0/0. Don't set this ip for production.
-   Add port to env file
-   Connect db with backend using connection string from compass.

# Major Dependencies

-   Install mongoose, dotenv and express.
-   Install cookie-parser, cors.

# Configuring MiddleWare

-   cors
-   static data
-   data from url(url encoding)
-   cookieParser

# What is MiddleWare

-   Now user send some request on instagram.com/something now api will be called to serve this request and give some response. Before serving this request we want to check whether user is logged in or not. This is done by middleware and we can can add more than one middleware before these request.

# Notes to keep in mind

-   Always remember "Database is in another continent" so it will take time to respond.
-   Always use async-await and try-catch (because there are more chance of things not going your - - way) for db.
-   Use app.use() for middlewares
