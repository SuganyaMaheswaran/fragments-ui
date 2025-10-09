// src/api.js

// fragments microservice API to use, defaults to localhost:8080 if not set in env
const apiUrl = process.env.API_URL || 'http://localhost:8080';

/**
 * Given an authenticated user, request all fragments for this user from the
 * fragments microservice (currently only running locally). We expect a user
 * to have an `idToken` attached, so we can send that along with the request.
 *
 * @param {Object} user - Authenticated user object with idToken
 * @param {boolean} expand - Whether to expand fragment metadata
 */
export async function getUserFragments(user, expand = true) {
  console.log('Requesting user fragments data...');

  try {
    // Add ?expand=true if requested
    const fragmentsUrl = new URL('/v1/fragments', apiUrl);
    if (expand) {
      fragmentsUrl.searchParams.append('expand', '1'); // or 'true', depending on API
    }

    const res = await fetch(fragmentsUrl, {
      headers: user.authorizationHeaders(),
    });

    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    console.log('Successfully got user fragments data', { data });
    return data;
  } catch (err) {
    console.error('Unable to call GET /v1/fragments', { err });
  }
}
