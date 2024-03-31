export default class APIServer {
  constructor() {
    this.baseURL = import.meta.env.VITE_PRODUCTION_URL;
    this.apiKey = import.meta.env.VITE_API_KEY;
  }

  async convertToJson(res) {
    const responseBody = await res.json();
    if (res.ok) {
      return responseBody;
    } else {
      handleErrorMessage(responseBody)
    }
  }

  async fetchData(endpoint, payload = '') {
    const options = {
      method: 'POST',
      headers: {
        'x-api-key': this.apiKey,
        'Accept': 'application/json',
        'Content-Type': 'text/plain'
      },
      body: payload
    };

    const response = await fetch(this.baseURL + endpoint, options);
    return this.convertToJson(response);
  }
}

function handleErrorMessage(responseBody) {
  let errorMessages = [];

  // Fallback for generic or other specific errors
  if (errorMessages.length === 0) {
    if (responseBody.message) {
      errorMessages.push(responseBody.message);
    } else {
      try {
        // Attempt to use a stringified version of the response if available
        errorMessages.push(JSON.stringify(responseBody));
      } catch {
        // Use a generic error message as a last resort
        errorMessages.push('An unknown error occurred');
      }
    }
  }
  throw { name: 'servicesError', message: errorMessages };
}
