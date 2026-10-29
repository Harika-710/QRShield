import { useState, useRef } from "react";
import jsQR from "jsqr";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [manualUrl, setManualUrl] = useState("");
  const [activeTab, setActiveTab] = useState("upload"); // 'upload' | 'manual'
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);
  const fileInputRef = useRef(null);

  // Helper to decode QR code from an image file in browser
  const decodeQrImage = (imageFile) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;
          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0);

          const imageData = ctx.getImageData(0, 0, img.width, img.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: "attemptBoth",
          });

          if (code && code.data) {
            resolve(code.data);
          } else {
            reject(
              new Error(
                "Could not detect a valid QR code in this image. Please make sure the image is clear and well-lit."
              )
            );
          }
        };
        img.onerror = () => reject(new Error("Unable to load selected image."));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error("Failed to read image file."));
      reader.readAsDataURL(imageFile);
    });
  };

  // Send content to backend security API
  const analyzeWithBackend = async (payloadContent) => {
    setIsAnalyzing(true);
    setErrorMessage("");
    setResult(null);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ content: payloadContent }),
      });

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        setResult(data.data);
      } else {
        setErrorMessage(data.error || "Failed to analyze destination.");
      }
    } catch (err) {
      console.error("Backend error:", err);
      setErrorMessage(
        "Could not connect to the QRShield backend server. Please make sure your backend server is running on port 5000."
      );
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleFileChange = (e) => {
    const selected = e.target.files?.[0] || null;
    setFile(selected);
    setErrorMessage("");
    setResult(null);

    if (selected) {
      const objectUrl = URL.createObjectURL(selected);
      setPreviewUrl(objectUrl);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleScanUploadedFile = async () => {
    if (!file) {
      setErrorMessage("Please choose a QR code image first.");
      return;
    }

    setIsAnalyzing(true);
    setErrorMessage("");
    setResult(null);

    try {
      const decodedText = await decodeQrImage(file);
      await analyzeWithBackend(decodedText);
    } catch (err) {
      setIsAnalyzing(false);
      setErrorMessage(err.message);
    }
  };

  const handleManualAnalyze = (urlToTest) => {
    const target = urlToTest || manualUrl;
    if (!target || !target.trim()) {
      setErrorMessage("Please enter a URL or web address to analyze.");
      return;
    }
    analyzeWithBackend(target.trim());
  };

  const copyToClipboard = (text) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const resetScanner = () => {
    setFile(null);
    setPreviewUrl(null);
    setResult(null);
    setErrorMessage("");
    setManualUrl("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="app">
      <nav className="navbar">
        <a href="#" className="logo">
          <span className="logo-icon">⬡</span>
          QR<span>Shield</span>
        </a>

        <div className="nav-links">
          <a href="#home">Home</a>
          <a href="#features">Features</a>
          <a href="#how">How It Works</a>
        </div>

        <a href="#scanner" className="nav-btn">
          Get Started ↗
        </a>
      </nav>

      <section className="hero" id="home">
        <div className="hero-content">
          <div className="status">
            <span className="dot"></span>
            YOUR DIGITAL SAFETY STARTS HERE
          </div>

          <h1>
            Every Scan
            <br />
            Deserves a
            <br />
            <span>Security Check.</span>
          </h1>

          <p className="description">
            QR codes make life easier, but hidden links can expose you to phishing,
            scams, and malicious websites. QRShield inspects QR code destinations
            and identifies suspicious warning signs before you decide to visit them.
          </p>

          <div className="hero-buttons">
            <a href="#scanner" className="primary-btn">
              ⛨ Analyze a QR Code <span>↗</span>
            </a>
            <a href="#how" className="secondary-btn">
              Explore Protection ↓
            </a>
          </div>

          <div className="trust">
            <span>✓ No automatic link opening</span>
            <span>✓ Deep heuristics & threat detection</span>
          </div>
        </div>

        <div className="hero-visual">
          <div className="orbit orbit-one"></div>
          <div className="orbit orbit-two"></div>

          <div className="scan-card">
            <div className="scan-top">
              <span>QR SECURITY SCANNER</span>
              <span className="live">
                <i></i> ACTIVE
              </span>
            </div>

            <div className="qr-frame">
              <div className="corner tl"></div>
              <div className="corner tr"></div>
              <div className="corner bl"></div>
              <div className="corner br"></div>

              <div className="fake-qr">
                <div className="finder finder-one"></div>
                <div className="finder finder-two"></div>
                <div className="finder finder-three"></div>
                <div className="qr-pattern"></div>
              </div>

              <div className="scan-line"></div>
              <div className="shield">✓</div>
            </div>

            <div className="scan-footer">
              <div>
                <small>PROTECTION STATUS</small>
                <h3>Backend Connected</h3>
              </div>
              <span className="shield-small">⬡</span>
            </div>
          </div>

          <div className="floating-tag tag-top">
            <span>✳</span> Real-Time Threat Analysis
          </div>

          <div className="floating-tag tag-bottom">
            <span>⌁</span> Zero Unverified Redirects
          </div>
        </div>
      </section>

      <section className="stats">
        <div>
          <h2>01</h2>
          <p>Upload a QR image</p>
        </div>
        <div>
          <h2>02</h2>
          <p>Inspect the destination</p>
        </div>
        <div>
          <h2>03</h2>
          <p>Review security warnings</p>
        </div>
      </section>

      <section className="scanner-section" id="scanner">
        <div className="section-heading">
          <p className="eyebrow">YOUR FIRST LINE OF DEFENCE</p>
          <h2>Scan Smart. Stay Protected.</h2>
          <p>
            Upload your QR code image to inspect its destination, or type a link
            directly to evaluate potential phishing and malicious signals.
          </p>
        </div>

        <div className="scanner-container">
          {/* Tabs for scanning mode */}
          <div className="tab-buttons">
            <button
              className={`tab-btn ${activeTab === "upload" ? "active" : ""}`}
              onClick={() => setActiveTab("upload")}
            >
              📷 Upload QR Image
            </button>
            <button
              className={`tab-btn ${activeTab === "manual" ? "active" : ""}`}
              onClick={() => setActiveTab("manual")}
            >
              🔗 Inspect Direct URL
            </button>
          </div>

          <div className="upload-box">
            {activeTab === "upload" ? (
              <>
                <div className="upload-icon">↑</div>
                <h3>Upload Your QR Code</h3>
                <p>
                  Choose a QR code image (PNG, JPG, WEBP) from your device to decode and
                  inspect.
                </p>

                {previewUrl && (
                  <div className="image-preview-wrapper">
                    <img
                      src={previewUrl}
                      alt="Selected QR preview"
                      className="qr-image-preview"
                    />
                  </div>
                )}

                <label className="file-btn">
                  Choose QR Image
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleFileChange}
                  />
                </label>

                <p className="file-info">
                  {file ? file.name : "PNG, JPG or WEBP"}
                </p>

                <button
                  className="analyze-btn"
                  onClick={handleScanUploadedFile}
                  disabled={isAnalyzing}
                >
                  {isAnalyzing ? "Analyzing Security Destination..." : "Begin Security Analysis →"}
                </button>
              </>
            ) : (
              <>
                <div className="upload-icon">🔍</div>
                <h3>Direct URL Inspector</h3>
                <p>
                  Enter any website address or test a potential link to evaluate safety,
                  impersonation, and security flags.
                </p>

                <div className="url-input-container">
                  <input
                    type="text"
                    className="url-text-input"
                    placeholder="e.g. https://paypal-security-update.xyz/login"
                    value={manualUrl}
                    onChange={(e) => setManualUrl(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleManualAnalyze();
                    }}
                  />
                  <button
                    className="analyze-btn"
                    onClick={() => handleManualAnalyze()}
                    disabled={isAnalyzing}
                  >
                    {isAnalyzing ? "Analyzing..." : "Analyze URL →"}
                  </button>
                </div>

                <div className="test-presets">
                  <span>Quick Test Links:</span>
                  <button
                    className="preset-btn safe"
                    onClick={() => {
                      setManualUrl("https://wikipedia.org");
                      handleManualAnalyze("https://wikipedia.org");
                    }}
                  >
                    Safe Link
                  </button>
                  <button
                    className="preset-btn danger"
                    onClick={() => {
                      setManualUrl("https://paypal-security-update.xyz/login");
                      handleManualAnalyze("https://paypal-security-update.xyz/login");
                    }}
                  >
                    Phishing Sample
                  </button>
                  <button
                    className="preset-btn warning"
                    onClick={() => {
                      setManualUrl("http://192.168.1.1/admin-login");
                      handleManualAnalyze("http://192.168.1.1/admin-login");
                    }}
                  >
                    IP / HTTP Link
                  </button>
                </div>
              </>
            )}

            {errorMessage && (
              <div className="error-alert">
                <span>⚠️</span> {errorMessage}
              </div>
            )}
          </div>

          {/* Results Display */}
          {result && (
            <div className={`result-card verdict-${result.verdict.toLowerCase()}`}>
              <div className="result-header">
                <div className="verdict-tag">
                  {result.verdict === "SAFE" && "🛡️ SAFE TO VISIT"}
                  {result.verdict === "SUSPICIOUS" && "⚠️ CAUTION / SUSPICIOUS"}
                  {result.verdict === "DANGEROUS" && "🛑 HIGH RISK DETECTED"}
                </div>
                <div className="risk-score-display">
                  <span className="score-num">{result.riskScore}</span>
                  <span className="score-max">/100 Risk</span>
                </div>
              </div>

              <div className="risk-bar-track">
                <div
                  className="risk-bar-fill"
                  style={{
                    width: `${Math.max(5, result.riskScore)}%`,
                    backgroundColor:
                      result.verdict === "SAFE"
                        ? "#22c55e"
                        : result.verdict === "SUSPICIOUS"
                        ? "#f59e0b"
                        : "#ef4444",
                  }}
                ></div>
              </div>

              <p className="result-summary">{result.summary}</p>

              <div className="result-destination-box">
                <div className="dest-label">Decoded Destination ({result.contentType}):</div>
                <div className="dest-content">
                  <code>{result.rawContent}</code>
                  <button
                    className="copy-btn"
                    onClick={() => copyToClipboard(result.rawContent)}
                  >
                    {copied ? "✓ Copied" : "Copy"}
                  </button>
                </div>

                {result.unshortenedUrl && (
                  <div className="unshortened-box">
                    <span className="arrow-down">↳</span>
                    <strong>Expands to:</strong>
                    <code>{result.unshortenedUrl}</code>
                  </div>
                )}
              </div>

              {result.findings && result.findings.length > 0 && (
                <div className="findings-section">
                  <h4>Security Findings & Heuristics ({result.findings.length})</h4>
                  <div className="findings-list">
                    {result.findings.map((item, idx) => (
                      <div
                        key={idx}
                        className={`finding-item severity-${item.severity || "info"}`}
                      >
                        <div className="finding-icon">
                          {item.severity === "danger"
                            ? "🛑"
                            : item.severity === "warning"
                            ? "⚠️"
                            : "✓"}
                        </div>
                        <div className="finding-text">
                          <h5>{item.title}</h5>
                          <p>{item.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="result-actions">
                <button className="reset-btn" onClick={resetScanner}>
                  Scan Another Destination
                </button>
              </div>
            </div>
          )}
        </div>
      </section>

      <section className="features" id="features">
        <div className="section-heading">
          <p className="eyebrow">BUILT FOR A SAFER DIGITAL WORLD</p>
          <h2>More Awareness. Better Protection.</h2>
          <p>
            Understand where your QR codes lead and make more informed decisions
            with security-focused tools designed for everyday users.
          </p>
        </div>

        <div className="feature-grid">
          <article className="feature-card">
            <div className="feature-icon">⌕</div>
            <h3>Intelligent URL Inspection</h3>
            <p>
              Decode QR destinations and inspect URL structures to identify
              common warning signs associated with suspicious links.
            </p>
            <span>01 / URL ANALYSIS</span>
          </article>

          <article className="feature-card">
            <div className="feature-icon">⬡</div>
            <h3>Suspicious Signal Detection</h3>
            <p>
              Highlight unusual URL patterns, unexpected protocols, and other
              indicators that deserve closer attention before visiting a website.
            </p>
            <span>02 / RISK AWARENESS</span>
          </article>

          <article className="feature-card">
            <div className="feature-icon">◈</div>
            <h3>Privacy-Conscious Design</h3>
            <p>
              Build safer scanning habits with a workflow that avoids
              automatically opening decoded links and minimises unnecessary data
              storage.
            </p>
            <span>03 / PRIVACY FIRST</span>
          </article>
        </div>
      </section>

      <section className="how-section" id="how">
        <p className="eyebrow">SIMPLE. SMART. SECURITY-FOCUSED.</p>
        <h2>How QRShield Works</h2>

        <div className="steps">
          <div className="step">
            <span>01</span>
            <h3>Upload</h3>
            <p>
              Select a QR code image containing the destination you want to inspect.
            </p>
          </div>

          <div className="step">
            <span>02</span>
            <h3>Analyze</h3>
            <p>
              Decode its content and examine the URL for suspicious patterns, brand
              spoofing, and malicious indicators.
            </p>
          </div>

          <div className="step">
            <span>03</span>
            <h3>Review</h3>
            <p>
              Read the detected warnings and decide carefully whether to proceed.
            </p>
          </div>
        </div>
      </section>

      <footer className="footer">
        <a href="#home" className="logo">
          ⬡ QR<span>Shield</span>
        </a>
        <p>Scan with awareness. Navigate with confidence.</p>
        <small>
          QRShield © 2026 · A cybersecurity awareness project. No basic scan can
          guarantee complete safety.
        </small>
      </footer>
    </div>
  );
}

export default App;
