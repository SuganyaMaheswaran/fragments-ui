// main entry point
// fragments microservice API to use, defaults to localhost:8080 if not set in env
const apiUrl = process.env.API_URL || "http://localhost:8080";

/**
 * Given an authenticated user, request all fragments for this user from the
 * fragments microservice (currently only running locally). We expect a user
 * to have an `idToken` attached, so we can send that along with the request.
 *
 * @param {Object} user - Authenticated user object with idToken
 * @param {boolean} expand - Whether to expand fragment metadata
 */

async function getUserFragments(user, expand = true) {
  try {
    // Add ?expand=true if requested
    const fragmentsUrl = new URL("/v1/fragments", apiUrl);
    if (expand) {
      fragmentsUrl.searchParams.append("expand", "true");
    }

    const res = await fetch(fragmentsUrl, {
      headers: user.authorizationHeaders(),
    });

    if (!res.ok) {
      throw new Error(`${res.status} ${res.vb}`);
    }

    const data = await res.json();
    return data;
  } catch (err) {
    console.error("Unable to call GET /v1/fragments", { err });
  }
}

async function getFragmentById(user, id, ext = '') {
  console.log("User AuthroizationHeaders: ", user)
  console.log("ext: ", ext)
  try {
    const res = await fetch(`${apiUrl}/v1/fragments/${id}${ext}`, {
      headers: user.authorizationHeaders(),
      cache: "no-store",
    });
    if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);

    const contentType = res.headers.get("Content-Type")?.split(";")[0];

    // Text / JSON cases
    if (contentType === "text/plain" || contentType === "text/html" || contentType === "text/markdown") {
      return await res.text();
    } 
    if (contentType === "application/json") {
      return { fragment: await res.json() };
    }

    // Image cases
    if (contentType.startsWith("image/")) {
      const arrayBuffer = await res.arrayBuffer(); // raw bytes
      const blob = new Blob([arrayBuffer], { type: contentType });
      const blobUrl=URL.createObjectURL(blob); // browser-only Blob URL
      console.log(blobUrl)
      return blobUrl
    }
  

    throw new Error(`Unknown content type: ${contentType}`);
  } catch (err) {
    console.error("Unable to call GET /v1/fragments/:id", { err });
    return null;
  }
}
async function deleteFragment(user, id) {
  try {
    const res = await fetch(`${apiUrl}/v1/fragments/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${user.idToken}`,
      },
    });

    if (!res.ok) {
      throw new Error(
        `Failed to delete fragment: ${res.status} ${res.statusText}`
      );
    }

    console.log(`Fragment ${id} deleted successfully`);
  } catch (err) {
    console.error("Error deleting fragment:", err);
    throw err; // re-throw so caller can handle
  }
}

async function postFragment(user, data, type) {
  console.log("inside postFragment")

  try {
    
   const res = await fetch(`${process.env.API_URL}/v1/fragments`, {
        method: "POST",
        headers: {
          "Content-Type": type,
          Authorization: `Bearer ${user.idToken}`,
        },
        body: data,
      });

    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }

    return await res.json();
  } catch (err) {
    console.error("Error posting fragment:", err);
    throw err;
  }
}
async function updateFragment(user,id, data, type){
  console.log(user)
  try{
 const res = await fetch(`${process.env.API_URL}/v1/fragments:${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": type,
          Authorization: `Bearer ${user.idToken}`,
        },
        body: data,
      });

    if (!res.ok) {
      throw new Error(`${res.status} ${res.statusText}`);
    }

    return await res.json();
  } catch (err) {
    console.error("Error posting fragment:", err);
    throw err;
  }
}

export { getFragmentById, getUserFragments, postFragment, deleteFragment, updateFragment };
