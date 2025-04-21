
import { BASE_URL } from './auth';

// Helper function to test API connectivity and available endpoints
export async function testBackendConnectivity() {
  try {
    // Test basic connectivity
    console.log("Testing backend connectivity...");
    const homeRes = await fetch(`${BASE_URL}/home`, {
      method: "GET"
    });
    
    // Check if response is JSON before parsing
    const contentType = homeRes.headers.get("content-type");
    let homeData;
    
    if (homeRes.ok) {
      if (contentType && contentType.includes("application/json")) {
        homeData = await homeRes.json();
        console.log("✅ Home endpoint working:", homeData);
      } else {
        // Handle non-JSON response
        const textResponse = await homeRes.text();
        console.log("⚠️ Home endpoint returned non-JSON response:", 
          textResponse.substring(0, 100) + "...");
        return {
          isConnected: false,
          authWorking: false,
          dataEndpointsWorking: false,
          error: "Backend returned HTML instead of JSON. Please ensure your Flask backend is configured correctly."
        };
      }
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
        const authContentType = authRes.headers.get("content-type");
        if (authContentType && authContentType.includes("application/json")) {
          userData = await authRes.json();
          authResStatus = true;
          console.log("✅ Auth /me endpoint working:", userData);
        } else {
          console.error("❌ Auth /me endpoint returned non-JSON response");
        }
      } else {
        console.error("❌ Auth /me endpoint failed:", authRes.status);
      }
    } else {
      console.log("ℹ️ No token found, skipping /me endpoint test");
    }

    // Test route data endpoints
    console.log("\nTesting data endpoints...");
    const heatmapRes = await fetch(`${BASE_URL}/heatmap_data`, {
      method: "GET"
    });
    
    let heatmapData;
    const heatmapContentType = heatmapRes.headers.get("content-type");
    
    if (heatmapRes.ok && heatmapContentType && heatmapContentType.includes("application/json")) {
      heatmapData = await heatmapRes.json();
      console.log(`✅ Heatmap data endpoint working (${heatmapData.length} points received)`);
    } else {
      console.error("❌ Heatmap data endpoint failed:", 
        heatmapRes.ok ? "Non-JSON response" : heatmapRes.status);
    }

    // Overall status
    console.log("\n=== Backend Connectivity Summary ===");
    console.log(`Backend URL: ${BASE_URL}`);
    console.log("Basic connectivity: " + (homeRes.ok && homeData ? "✅" : "❌"));
    console.log("Authentication: " + (token ? (authResStatus ? "✅" : "❌") : "⚠️ Not tested (no token)"));
    console.log("Data endpoints: " + (heatmapRes.ok && heatmapData ? "✅" : "❌"));

    // If any response returned HTML instead of JSON, indicate this is likely a configuration issue
    if ((homeRes.ok && !homeData) || 
        (token && authResStatus === false) || 
        (heatmapRes.ok && !heatmapData)) {
      return {
        isConnected: false,
        authWorking: false,
        dataEndpointsWorking: false,
        error: "Backend is returning HTML instead of JSON. This typically happens when requests are being routed to the frontend server instead of the API server."
      };
    }

    return {
      isConnected: homeRes.ok && !!homeData,
      authWorking: token ? authResStatus : null,
      dataEndpointsWorking: heatmapRes.ok && !!heatmapData,
      userData: userData
    };
  } catch (error) {
    console.error("Backend connectivity test failed:", error);
    return {
      isConnected: false,
      authWorking: false,
      dataEndpointsWorking: false,
      error: error
    };
  }
}
