import * as jose from 'https://deno.land/x/jose@v4.14.4/index.ts';

// Replace this with the real Citadex Firebase project ID before deploying.
const FIREBASE_PROJECT_ID = 'citadex-eeea0';

const JWKS_URL = `https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com`;
const ISSUER = `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`;
const AUDIENCE = FIREBASE_PROJECT_ID;

const JWKS = jose.createRemoteJWKSet(new URL(JWKS_URL));

export interface FirebaseTokenPayload {
  uid: string;
  email?: string;
  name?: string;
  picture?: string;
}

/**
 * Verifies a Firebase ID token (JWT) and returns the decoded payload.
 * Throws if the token is invalid, expired, or for the wrong project.
 */
export async function verifyFirebaseToken(
  token: string,
): Promise<FirebaseTokenPayload> {
  const { payload } = await jose.jwtVerify(token, JWKS, {
    issuer: ISSUER,
    audience: AUDIENCE,
  });

  const uid = payload['user_id'] ?? payload['sub'];
  if (!uid || typeof uid !== 'string') {
    throw new Error('Token missing user_id/sub claim');
  }

  return {
    uid,
    email: typeof payload['email'] === 'string' ? payload['email'] : undefined,
    name: typeof payload['name'] === 'string' ? payload['name'] : undefined,
    picture: typeof payload['picture'] === 'string' ? payload['picture'] : undefined,
  };
}
