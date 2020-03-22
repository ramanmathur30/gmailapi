var express = require('express');
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');

var app = express();

// If modifying these scopes, delete token.json.
const SCOPES = ['https://www.googleapis.com/auth/gmail.readonly'];
// The file token.json stores the user's access and refresh tokens, and is
// created automatically when the authorization flow completes for the first
// time.
const TOKEN_PATH = 'token.json';

/*
// Load client secrets from a local file.
fs.readFile('credentials.json', (err, content) => {
  if (err) return console.log('Error loading client secret file:', err);
  // Authorize a client with credentials, then call the Gmail API.
  //authorize(JSON.parse(content), listLabels);//Get Label
  //authorize(JSON.parse(content), listMgs);//Get Message List 10
  //authorize(JSON.parse(content), listModifyMgs);//Get modify message
  authorize(JSON.parse(content), listDeleteMgs);//Delete Message
});
*/



/**
 * Create an OAuth2 client with the given credentials, and then execute the
 * given callback function.
 * @param {Object} credentials The authorization client credentials.
 * @param {function} callback The callback to call with the authorized client.
 */
function authorize(credentials, callback) {
  const {client_secret, client_id, redirect_uris} = credentials.installed;
  const oAuth2Client = new google.auth.OAuth2(
      client_id, client_secret, redirect_uris[0]);

  // Check if we have previously stored a token.
  fs.readFile(TOKEN_PATH, (err, token) => {
    if (err) return getNewToken(oAuth2Client, callback);
    oAuth2Client.setCredentials(JSON.parse(token));
    callback(oAuth2Client);
  });
}

/**
 * Get and store new token after prompting for user authorization, and then
 * execute the given callback with the authorized OAuth2 client.
 * @param {google.auth.OAuth2} oAuth2Client The OAuth2 client to get token for.
 * @param {getEventsCallback} callback The callback for the authorized client.
 */
function getNewToken(oAuth2Client, callback) {
  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });
  console.log('Authorize this app by visiting this url:', authUrl);
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
  rl.question('Enter the code from that page here: ', (code) => {
    rl.close();
    oAuth2Client.getToken(code, (err, token) => {
      if (err) return console.error('Error retrieving access token', err);
      oAuth2Client.setCredentials(token);
      // Store the token to disk for later program executions
      fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
        if (err) return console.error(err);
        console.log('Token stored to', TOKEN_PATH);
      });
      callback(oAuth2Client);
    });
  });
}

/**
 * Lists the labels in the user's account.
 *
 * @param {google.auth.OAuth2} auth An authorized OAuth2 client.
 */

app.get('/api/getlabel',function(req,resp1){
	fs.readFile('credentials.json', (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        // Authorize a client with credentials, then call the Gmail API.
        authorize(JSON.parse(content), listLabeling);//Get Label

        function listLabeling(auth) {
            const gmail = google.gmail({version: 'v1', auth});
            return gmail.users.labels.list({
              userId: 'me',
            }, (err, res) => {
              if (err) return console.log('The API returned an error: ' + err);
              const labels = res.data.labels;
              if (labels.length) {
                console.log('Labels:');
                resp1.send(labels);
                labels.forEach((label) => {
                  console.log(`- ${label.name}`);
                });
              } else {
                console.log('No labels found.');
              }
            });
          }
      });
});

app.get('/api/getmsglist',function(req,resp1){
    fs.readFile('credentials.json', (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        // Authorize a client with credentials, then call the Gmail API.
        authorize(JSON.parse(content), listMgs);//Get Label
        function listMgs(auth) {
            const gmail = google.gmail({version: 'v1', auth});
            var initialRequest = gmail.users.messages.list({
                'userId': "me",
                //'q': query,
                "maxResults":10
            }, (err, res) => {
                if (err) return console.log('The API returned an error: ' + err);
                //console.log("res--->>>",JSON.stringify(res));
                resp1.send(res);
            });
        }
    })
})

app.get('/api/getmsgdetail',function(req,resp1){
    fs.readFile('credentials.json', (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        // Authorize a client with credentials, then call the Gmail API.
        authorize(JSON.parse(content), listMgs);//Get Label
        function listMgs(auth) {
            const gmail = google.gmail({version: 'v1', auth});
            var request = gmail.users.messages.get({
                'userId': "me",
                'id': "17101e94f38b286e"
              }, (err, res) => {
                if (err) return console.log('The API returned an error: ' + err);
                //console.log("res--->>>",JSON.stringify(res));
                resp1.send(res);
            });
        }
    })
})


  app.get('/api/getmsgdelete',function(req,resp1){
    fs.readFile('credentials.json', (err, content) => {
        if (err) return console.log('Error loading client secret file:', err);
        // Authorize a client with credentials, then call the Gmail API.
        authorize(JSON.parse(content), listDeleteMgs);//Get Label
        function listDeleteMgs(auth) {
            const gmail = google.gmail({version: 'v1', auth});
            var request = gmail.users.messages.delete({
                'userId': "me",
                'id': "17101e94f38b286e"//messageId
              }, (err, res) => {
                if (err){
                    resp1.send(err);
                }else{ 
                    resp1.send(res);
                }
              });
              
          }
    })
})


  

  app.listen(3000 , function () {
	console.log ('listening to 3000');
});