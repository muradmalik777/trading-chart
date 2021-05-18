export async function makeApiRequest(path) {
    try {
        const options = {
            method: 'GET',
            headers: {
                "authorization": "Apikey ed56bc86b8680a0896f22cc99aa336531b3016da0c6d0512891caa7f4b253928"
            }
        };
        const response = await fetch(`https://min-api.cryptocompare.com/${path}`, options);
        return response.json();
    } catch(error) {
        throw new Error(`CryptoCompare request error: ${error.status}`);
    }
}