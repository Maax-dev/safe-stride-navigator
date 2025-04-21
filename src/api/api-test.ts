
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
      const homeData = await homeRes.json();
      console.log("✅ Home endpoint working:", homeData);
    } else {
      console.error("❌ Home endpoint failed:", homeRes.status);
    }

    // Test authentication endpoints
    console.log("\nTesting authentication endpoints...");
    
    // Check if /me endpoint is working
    const token = localStorage.getItem('token');
    if (token) {
      const authRes = await fetch(`${BASE_URL}/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (authRes.ok) {
        const userData = await authRes.json();
        console.log("✅ Auth /me endpoint working:", userData);
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
    
    if (heatmapRes.ok) {
      const heatmapData = await heatmapRes.json();
      console.log(`✅ Heatmap data endpoint working (${heatmapData.length} points received)`);
    } else {
      console.error("❌ Heatmap data endpoint failed:", heatmapRes.status);
    }

    // Overall status
    console.log("\n=== Backend Connectivity Summary ===");
    console.log(`Backend URL: ${BASE_URL}`);
    console.log("Basic connectivity: " + (homeRes.ok ? "✅" : "❌"));
    console.log("Authentication: " + (token ? (authRes?.ok ? "✅" : "❌") : "⚠️ Not tested (no token)"));
    console.log("Data endpoints: " + (heatmapRes.ok ? "✅" : "❌"));

    return {
      isConnected: homeRes.ok,
      authWorking: token ? (authRes?.ok || false) : null,
      dataEndpointsWorking: heatmapRes.ok
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
