let testUrn = 'TODO: Set URN';
let tokenFetchingUrl = 'TODO: Set token server url';

// TODO: Change this method to correctly parse token from whatever backend is being used
let tokenFactory = function getAccessToken(onGetAccessToken) {
    fetch(tokenFetchingUrl)
    .then(response => response.json())
    .then(data => {

        let accessToken = data["accessToken"];
        let expireTimeSeconds = data["expiresIn"];
        onGetAccessToken(accessToken, expireTimeSeconds);
    });
}