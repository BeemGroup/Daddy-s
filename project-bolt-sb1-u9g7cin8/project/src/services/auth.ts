// Service d'authentification sécurisé
const AUTH_KEY = 'auth_token';
const AUTH_TIMESTAMP = 'auth_timestamp';
const SESSION_DURATION = 3600000; // 1 heure en millisecondes

interface Credentials {
  username: string;
  password: string;
}

// Fonction de hachage simple pour l'exemple
// Dans un environnement de production, utilisez une bibliothèque de cryptographie appropriée
const hash = async (str: string) => {
  const msgBuffer = new TextEncoder().encode(str);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const generateToken = async () => {
  const timestamp = Date.now();
  const randomStr = Math.random().toString(36).substring(2);
  return {
    token: await hash(`${timestamp}-${randomStr}`),
    timestamp
  };
};

const isTokenExpired = (timestamp: number) => {
  return Date.now() - timestamp > SESSION_DURATION;
};

export const login = async (credentials: Credentials) => {
  try {
    const { username, password } = credentials;

    // Vérification des variables d'environnement
    const envUsername = import.meta.env.VITE_ADMIN_USERNAME;
    const envPasswordHash = import.meta.env.VITE_ADMIN_PASSWORD_HASH;

    if (!envUsername || !envPasswordHash) {
      console.error('Configuration d\'authentification manquante');
      return false;
    }

    const inputPasswordHash = await hash(password);
    
    if (username === envUsername && inputPasswordHash === envPasswordHash) {
      const { token, timestamp } = await generateToken();
      sessionStorage.setItem(AUTH_KEY, token);
      sessionStorage.setItem(AUTH_TIMESTAMP, timestamp.toString());
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Erreur lors de l\'authentification:', error);
    return false;
  }
};

export const logout = () => {
  sessionStorage.removeItem(AUTH_KEY);
  sessionStorage.removeItem(AUTH_TIMESTAMP);
  window.location.href = '/';
};

export const isAuthenticated = () => {
  try {
    const token = sessionStorage.getItem(AUTH_KEY);
    const timestamp = sessionStorage.getItem(AUTH_TIMESTAMP);

    if (!token || !timestamp) {
      return false;
    }

    // Vérification de l'expiration
    if (isTokenExpired(parseInt(timestamp, 10))) {
      logout();
      return false;
    }

    return true;
  } catch {
    return false;
  }
};