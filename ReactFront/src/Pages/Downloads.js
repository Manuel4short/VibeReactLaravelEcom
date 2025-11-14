import React, { useState, useEffect } from "react";
// Import React and hooks for state and side effects

import axios from "axios";
// Import HTTP client for API calls

import { useParams } from "react-router-dom";
// Import hook to access URL parameters

function Downloads() {
  // Define the Downloads component

  const [email, setEmail] = useState("");
  // State for user's email input

  const [downloads, setDownloads] = useState([]);
  // State to store list of user's downloads

  const [message, setMessage] = useState("");
  // State for status/error messages

  const { token } = useParams();
  // Extract 'token' parameter from URL

  useEffect(() => {
    // Effect that runs when component mounts or token changes

    if (token) {
      // If token exists in URL, handle automatic download
      const handleDownload = async () => {
        // Async function to handle file download
        try {
          setMessage("Your download is starting...");
          // Show loading message

          const res = await axios.get(
            `${process.env.REACT_APP_API_URL}/download/${token}`,
            {
              responseType: "blob", // Server should return file as blob
            }
          );

          // Get filename from response headers
          const contentDisposition = res.headers["content-disposition"];
          let filename = "downloaded-file";
          if (contentDisposition) {
            const filenameMatch = contentDisposition.match(/filename="(.+)"/);
            if (filenameMatch && filenameMatch.length > 1) {
              filename = filenameMatch[1]; // Extract actual filename
            }
          }

          // Create temporary URL for the downloaded file
          const url = window.URL.createObjectURL(new Blob([res.data]));
          const link = document.createElement("a");
          link.href = url;
          link.setAttribute("download", filename); // Set download attribute
          document.body.appendChild(link);
          link.click(); // Programmatically click link to trigger download
          link.remove(); // Clean up DOM
          setMessage("Download successful! 🎉");
        } catch (error) {
          // Handle download errors
          const reader = new FileReader();
          reader.onload = () => {
            // Parse error response from server
            const errorData = JSON.parse(reader.result);
            setMessage(`Error: ${errorData.message}`);
          };
          reader.readAsText(error.response.data);
        }
      };
      handleDownload();
    }
  }, [token]); // Effect dependency - runs when token changes

  const fetchDownloads = async () => {
    // Function to fetch user's download history
    try {
      setMessage("");
      const res = await axios.get(
        `${process.env.REACT_APP_API_URL}/api/downloads?email=${email}`
      );
      if (res.data.length === 0) {
        setMessage("No downloads found for this email.");
      }
      setDownloads(res.data); // Update downloads state with API response
    } catch (error) {
      setMessage("Could not fetch downloads. Please try again.");
    }
  };

  if (token) {
    // If token in URL, show download status page
    return (
      <div className="container mt-4">
        <h4>Download Status</h4>
        <p>{message}</p> {/* Show download status message */}
      </div>
    );
  }

  // Main UI - email input and downloads list
  return (
    <div className="container mt-4">
      <h4>My Downloads</h4>
      <p>Enter the email you used during purchase to see your downloads.</p>

      {/* Email input field */}
      <input
        type="email"
        className="form-control mb-3"
        placeholder="Enter your purchase email"
        value={email}
        onChange={(e) => setEmail(e.target.value)} // Update email state on typing
      />

      {/* Button to fetch downloads */}
      <button className="btn btn-primary mb-4" onClick={fetchDownloads}>
        Check Downloads
      </button>

      {/* Status message display */}
      {message && <p className="text-info">{message}</p>}

      {/* Map through downloads array and render each item */}
      {downloads.map((item) => (
        <div key={item.id} className="border p-3 mb-3">
          {/* Display filename from file_path */}
          <h5>
            {item.file_path
              ? item.file_path.split("/").pop()
              : "Filename not available"}
          </h5>

          {/* Show remaining downloads (3 max) */}
          <p>Downloads Remaining: {3 - item.download_count}</p>

          {/* Conditional rendering based on download status */}
          {item.download_count >= 3 ? (
            <span className="text-danger">Download limit reached</span>
          ) : item.expires_at && new Date(item.expires_at) < new Date() ? (
            <span className="text-danger">Link has expired</span>
          ) : (
            // Active download link
            <a
              href={`http://localhost:8000/api/download/${item.token}`}
              className="btn btn-success"
            >
              Download
            </a>
          )}
        </div>
      ))}
    </div>
  );
}

export default Downloads;
// Export component for use in other files
