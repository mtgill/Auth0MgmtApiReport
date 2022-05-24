# Auth0 Management Api Report
A web application and API that work together to generate a report of a tenants Clients and Actions. 

## Setup
1. This application uses an Express API that makes calls to Auth0 API's. If you already have an Auth0 API that you'd like to use, move on to step 2. Otherwise information on setting up a new Auth0 API can be found [here](https://auth0.com/docs/quickstart/backend/nodejs). If you're creating a new API, go ahead and Enable RBAC, Add Permissions in the Access Token, and Allow Offline Access. 

2. You will also need to create or select an Auth0 Regular Web Application, and information on how to create a new application can be found [here](https://auth0.com/docs/get-started/auth0-overview/create-applications/regular-web-apps). Make sure to configure the Allowed Callback and Logout URL's if you're creating a new application. You'll want to set your Callback Url(s) to include any pages that you'd like the user to have access to after they've authenticated through Auth0. For example, to run the app locally I've specified 'http://localhost:{PORT}/callback' as the callback URL, where PORT is the port you chose in your webapp/.env file. Similarly, Allowed Logout Urls designate where the user should be directed once they've logged out. In my case I want users redirected to the landing page with the link to log back in if they choose, so to do this locally my Allowed Logout URL is 'http://localhost:{PORT}' and again PORT should match the port you set in webapp/.env.

3. Once you've selected existing or created a new Auth0 API and Web Application, the next step is to fork this repository and clone a local copy down to your machine. This repository will contain two directories, a .gitignore, and this README document. 

4. Using your terminal, move to the api directory using `cd api`, and then run `npm install` to install all required modules. You will also need to create a .env file, and a sample has been provided for you. To easily copy the sample run `cp .env-sample .env`. We'll cover exactly what goes into the .env file in a later step. Keep this terminal window open as we'll need to use it later.

5. Open a new terminal window and navigate to the root of this project, and this time move into the webapp directory. Repeat the steps from step 4 to install the required modules and create a new .env file. Keep this terminal window open as well as we'll need to use it later.

**NOTE**
If you are going to share your local version of this project it is critical that the .env files are included in the .gitignore as they contain sensitive information. This project *should* take care of this for you but it's a good idea to always double check. 

6. Open your newly created api/.env file and fill in the values which can be found in the Auth0 dashboard by going to Applications => APIs => {The API you selected or created in step 1} => Machine to Machine Applications. Select the correct application and navigate to its Settings tab, this will have your DOMAIN, CLIENT_ID, and CLIENT_SECRET. **This is also a good time to confirm that your Machine to Machine app has the correct permissions, I'd start with read:reports and read:clients**  The PORT can be an open port of your choosing, or it will default to 8080. Set ALLOWED_AUDIENCES to your API's identifier which can be found in the General Settings menu. Save this file once complete

7. Now open the webapp/.env file and add the appropriate values. The ISSUER_BASE_URL is the Domain, API_URL is the route that you want to access the Express API from, APP_SESSION_SECRET can be any long (100+ char) string, PORT is the port that you'd like the application to run on, and API_AUDIENCE is your API's identifier. CLIENT_ID and CLIENT_SECRET can be found in the Basic Information section of your web applications Settings tab. Save this file once complete.

8. Navigate back to the terminal window where you're inside of the api directory, and start the server using `npm start`. Switch to the terminal for the webbapp directory and start the application using `npm start`. 

9. Open a browser and navigate to http://localhost:{PORT}, where PORT is the same value you defined in webapp/.env. You should see a landing page with a link to login, click the link and enter your Auth0 credentials. 

10. If you signed in successfully you should be taken to a home page where there's a View Report link, and Logout link, and a summary of your Auth0 user information. View Report will take you to the reports page which will display all of your Clients and their associated Actions. 
