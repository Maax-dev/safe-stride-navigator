
import { BASE_URL } from './auth';

// Helper function to test API connectivity and available endpoints
export async function testBackendConnectivity() {
  try {
    // Test basic connectivity
    console.log("Testing backend connectivity...");
    const homeRes = await fetch(`${BASE_URL}/home`, {
      method: "GET"
    });
    
    if (homeRes.ok) {
      // Try to parse as JSON first
      let homeData;
      try {
        homeData = await homeRes.json();
      } catch (e) {
        // If not JSON, get as text
        homeData = await homeRes.text();
        console.log("Home endpoint returned non-JSON response:", homeData);
      }
      console.log("✅ Home endpoint working");
    } else {
      console.error("❌ Home endpoint failed:", homeRes.status);
    }

    // Test authentication endpoints
    console.log("\nTesting authentication endpoints...");
    
    // Check if /me endpoint is working
    const token = localStorage.getItem('token');
    let authResStatus = false;
    let userData = null;
    
    if (token) {
      const authRes = await fetch(`${BASE_URL}/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (authRes.ok) {
        userData = await authRes.json();
        authResStatus = true;
        console.log("✅ Auth /me endpoint working:", userData);
      } else {
        console.error("❌ Auth /me endpoint failed:", authRes.status);
      }
    } else {
      console.log("ℹ️ No token found, skipping /me endpoint test");
    }

    // Test update_profile endpoint with CORS preflight check
    console.log("\nTesting update_profile endpoint...");
    if (token) {
      try {
        // First test with an OPTIONS request (CORS preflight)
        const preflightRes = await fetch(`${BASE_URL}/update_profile`, {
          method: "OPTIONS",
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        console.log("Update profile CORS preflight check:", preflightRes.status);
        console.log("CORS Headers:", {
          'Access-Control-Allow-Origin': preflightRes.headers.get('Access-Control-Allow-Origin'),
          'Access-Control-Allow-Methods': preflightRes.headers.get('Access-Control-Allow-Methods'),
          'Access-Control-Allow-Headers': preflightRes.headers.get('Access-Control-Allow-Headers'),
        });
        
        if (preflightRes.ok) {
          console.log("✅ Update profile CORS preflight passed");
        } else {
          console.log("⚠️ Update profile CORS preflight failed");
        }
        
        // Now test with a standard PUT request
        const testProfileRes = await fetch(`${BASE_URL}/update_profile`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: "test@example.com",
            emergency_contact: {
              name: "Test Contact",
              email: "contact@example.com"
            }
          })
        });
        
        console.log("Update profile endpoint PUT check:", testProfileRes.status);
        
        if (testProfileRes.ok) {
          console.log("✅ Update profile endpoint works correctly");
        } else {
          console.log("⚠️ Update profile endpoint has issues");
        }
      } catch (error) {
        console.error("❌ Update profile endpoint test failed:", error);
      }
    }

    // Test route data endpoints
    console.log("\nTesting data endpoints...");
    try {
      const heatmapRes = await fetch(`${BASE_URL}/heatmap_data`, {
        method: "GET"
      });
      
      if (heatmapRes.ok) {
        const heatmapData = await heatmapRes.json();
        console.log(`✅ Heatmap data endpoint working (${heatmapData.length} points received)`);
      } else {
        console.error("❌ Heatmap data endpoint failed:", heatmapRes.status);
      }
    } catch (error) {
      console.error("❌ Heatmap data endpoint error:", error);
    }

    // Overall status
    console.log("\n=== Backend Connectivity Summary ===");
    console.log(`Backend URL: ${BASE_URL}`);
    console.log("Basic connectivity: " + (homeRes.ok ? "✅" : "❌"));
    console.log("Authentication: " + (token ? (authResStatus ? "✅" : "❌") : "⚠️ Not tested (no token)"));
    
    return {
      isConnected: homeRes.ok,
      authWorking: token ? authResStatus : null,
      userData: userData
    };
  } catch (error) {
    console.error("Backend connectivity test failed:", error);
    return {
      isConnected: false,
      authWorking: false,
      error: error
    };
  }
}
