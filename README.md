# SetUp (1st commit)

-   installing nodemon
-   setting type as module in package.json
-   adding gitignore file and generate it from online gitignore generator
-   installing prettier
-   making prettierignore file
-   creating env file
-   creating necessary folder structure in src

# SetUp mongo atlas (2nd commit)

-   create account on mongo atlas
-   create project and set up access database user and access
-   create network access, set ip - 0.0.0.0/0. Don't set this ip for production.
-   Add port to env file
-   Connect db with backend using connection string from compass.

# Major Dependencies (3rd commit)

-   Install mongoose, dotenv and express.
-   Install cookie-parser, cors.

# Configuring MiddleWare (4th commit)

-   cors
-   static data
-   data from url(url encoding)
-   cookieParser

# creating utils for error and response (5th commit)

-   streamlining error and response.

# Creating Modals (6th commit)

-   user modal
-   video modal

# Dependency (7th commit)

-   install mongoose aggregate paginate
-   install bcrypt (password encryption)
-   install jsonWebToken (token encryption)

# (8th commit)

-   encrypting password before saving using bcrypt
-   generating access token and refresh token

# (9th commit)

-   install couldinary, multer(file upload)
-   writing cloudinary logic for file upload from local.
-   writing multer middleware for saving file to local.

# (10th commit)

-   Configuting routes and controlles.

# (11th commit)

-   Writing logic for user.
-   Accept fields from req.body
-   use multer middleware in user.routes.js and get files uploaded on system.
-   check for validation for each filed in user. For errors use ApiError Wrapper.
-   check whether user with similar username or email exist or not using operators.
-   Getting images and uploading to cloudinary.
-   Creating user, removing password and refreshToken.
-   Conforming user creation and sending response.

# (12th commit)

-   Testing on Postman

# (13th commit)

-   Creating login logic for user in controller.
-   Creating function for token generation in user controller.
-   Creating middleware for auth checking using jwt.
-   Creating logic for logging out user.

# (14th commit)

-   Adding new Endpoint for updatingAccessToken in user controller if refreshToken is not expired.

# (15th commit)

-   Creating subscription model
-   Creating endPoints in userController to update password, getCurrentUser, updateAccountDetails, updateAvatarImage and updateCoverImage.

# (16th commit)

-   Creating new endpoint in users controller for getting user channel Info.

# (17th commit)

-   Adding WatchHistory endPoint.

# What is MiddleWare

-   In simple terms : Jaha bhi jaa rhe ho ik baar milke jaana.

-   Now user send some request on instagram.com/something now api will be called to serve this request and give some response. Before serving this request we want to check whether user is logged in or not. This is done by middleware and we can can add more than one middleware before these request.

# What is accessToken and RefreshToken

-   WhenEven user logs into a system accessToken and RefreshToken is given to user. Generally accessToken has short span than refreshToken. Suppose after one day user again hit the endpoint and in backend the code will
    check whether user is still logged in or not. Since the accessToken expires after one day system will send 401 status to frontend and user have to login again. So instead of this what we can do once frontend get 401
    request it will send request to another endpoint to check refresh token for same user in db. If both are matched then system will generate new accessToken to user.

-   So in user experience he/she didn't logged in again but in backend its kind of logging in based on refreshToken.

# Notes to keep in mind

-   Always remember "Database is in another continent" so it will take time to respond.
-   Always use async-await and try-catch (because there are more chance of things not going your - - way) for db.
-   Use app.use() for middlewares
-   JWT is a bearer token. It's like a key.
-   When we do req.user.\_id what we will get some will say mongoDb id but we will only get string ('662552cbbcdf90fbf97fb8ca') not mongoDb id. MongoDb id is like this ObjectId('662552cbbcdf90fbf97fb8ca'). Since we use mongoose it will automatically convert this string to mongoDb id when we use find or findById. But when we use aggregation pipeline mongoose doesn't interfere with aggregation pipeline. The code written in aggregation pipeline goes directly.So here we need to make mongoose ObjectId. See in auth controller endpoint getWatchHistory.
