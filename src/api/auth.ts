
// Set the BASE_URL based on the environment
export const BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? "http://127.0.0.1:5000" 
  : window.location.origin.replace('3000', '5000').replace('8080', '5000'); // Dynamically determine backend URL in production

export async function registerUser(
  email: string,
  password: string,
  name: string,
  contactName: string,
  contactEmail: string
) {
  try {
    const res = await fetch(`${BASE_URL}/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        name,
        emergency_contact: {
          name: contactName,
          email: contactEmail
        }
      })
    });

    const data = await res.json();
    
    // Improved error handling based on status code
    if (!res.ok) {
      if (res.status === 409) {
        throw new Error("User already exists");
      } else {
        throw new Error(data.error || data.detail || "Signup failed");
      }
    }
    
    localStorage.setItem("token", data.token);
    return data;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
}

export async function loginUser(email: string, password: string) {
  try {
    const res = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });

    const data = await res.json();
    
    // Improved error handling
    if (!res.ok) {
      throw new Error(data.error || data.detail || "Login failed");
    }
    
    localStorage.setItem("token", data.token);
    return data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

export async function onAuthChanged(callback: (user: any) => void) {
  const token = localStorage.getItem("token");
  if (!token) return callback(null);

  try {
    const res = await fetch(`${BASE_URL}/me`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    console.log('Auth check response status:', res.status);

    if (res.ok) {
      const user = await res.json();
      callback(user);
    } else {
      console.error('Auth check failed with status:', res.status);
      callback(null);
    }
  } catch (error) {
    console.error("Auth check error:", error);
    callback(null);
  }
}

export async function updateUserProfile(
  email: string,
  contactName: string,
  contactEmail: string
) {
  const token = localStorage.getItem("token");
  if (!token) throw new Error("No authentication token found");

  try {
    // Add logs to debug the connection
    console.log(`Using backend URL: ${BASE_URL}`);
    console.log(`Sending profile update to: ${BASE_URL}/update_profile`);
    
    const res = await fetch(`${BASE_URL}/update_profile`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`
      },
      body: JSON.stringify({
        email,
        emergency_contact: {
          name: contactName,
          email: contactEmail
        }
      })
    });

    // Check response status first
    if (!res.ok) {
      if (res.status === 404) {
        throw new Error("Profile update endpoint not found. The server may need to be updated.");
      } else {
        throw new Error(`Server returned ${res.status}: ${res.statusText}`);
      }
    }
    
    // Only try to parse JSON if we have content
    const contentType = res.headers.get("content-type");
    let data;
    
    if (contentType && contentType.includes("application/json") && res.headers.get("content-length") !== "0") {
      data = await res.json();
    } else {
      // For empty responses or non-JSON responses
      data = { message: "Profile updated successfully" };
    }
    
    // Update local storage with new details
    const userData = JSON.parse(localStorage.getItem('safeStrideUser') || '{}');
    localStorage.setItem('safeStrideUser', JSON.stringify({
      ...userData,
      email,
      emergency_contact: {
        name: contactName,
        email: contactEmail
      }
    }));

    return data;
  } catch (error) {
    console.error("Profile update error:", error);
    throw error;
  }
}
