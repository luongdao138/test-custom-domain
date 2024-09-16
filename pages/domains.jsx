import axios from "axios";
import React, { useEffect, useState } from "react";

// const VERCEL_TEAM_ID = process.env.VERCEL_TEAM_ID;
// const VERCEL_PROJECT_ID = process.env.VERCEL_PROJECT_ID;
// const VERCEL_AUTH_TOKEN = process.env.VERCEL_AUTH_TOKEN;

const VERCEL_TEAM_ID = "team_2WbIs2NaljCkPOafvASMeeKA";
const VERCEL_PROJECT_ID = "prj_hfYC1qVscraAdxaa9320Pl0I6gNW";
const VERCEL_AUTH_TOKEN = "ZRSUiwenpr7z1PfmN1iKWKkU";

const axiosInstance = axios.create({
  baseURL: "https://api.vercel.com/v10",
  params: {
    teamId: VERCEL_TEAM_ID,
  },
  headers: {
    Authorization: `Bearer ${VERCEL_AUTH_TOKEN}`,
  },
});

const CustomDomainsPage = () => {
  const [domain, setDomain] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [currentDomain, setCurrentDomain] = useState(null);
  const [verifications, setVerifications] = useState();
  const [loading, setLoading] = useState(true);

  async function getListDomains() {
    try {
      const { data } = await axiosInstance.get(
        `/projects/${VERCEL_PROJECT_ID}/domains`
      );

      setCurrentDomain(
        data.domains.find((domain) => !domain.name.includes("vercel.app")) ??
          null
      );
    } catch (error) {}
  }

  async function getDomainConfig() {
    try {
      setLoading(true);
      const { data } = await axiosInstance.get(
        `/domains/${currentDomain.name}/config`
      );

      setIsVerified(!data.misconfigured && currentDomain.verified);
      if (!currentDomain.verified) {
        setVerifications(currentDomain.verification);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    getListDomains();
  }, []);

  useEffect(() => {
    if (currentDomain) {
      setDomain(currentDomain.name);
      getDomainConfig();
    } else {
      setDomain("");
      setIsVerified(false);
      setVerifications(null);
    }
  }, [currentDomain]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!domain) {
      return;
    }

    try {
      const { data } = await axiosInstance.post(
        `/projects/${VERCEL_PROJECT_ID}/domains`,
        {
          name: domain,
        },
        {
          params: {
            teamId: VERCEL_TEAM_ID,
          },
          headers: {
            Authorization: `Bearer ${VERCEL_AUTH_TOKEN}`,
          },
        }
      );

      getListDomains();
    } catch (error) {
      console.error(error);
    }
  };

  const handleRemove = async () => {
    if (!currentDomain) {
      return;
    }

    try {
      await axiosInstance.delete(
        `/projects/${VERCEL_PROJECT_ID}/domains/${currentDomain.name}`
      );

      getListDomains();
    } catch (error) {}
  };

  const renderVerification = (v) => {
    return (
      <tr>
        <td style={{ padding: "8px" }}>{v.type}</td>
        <td style={{ padding: "8px" }}>_vercel</td>
        <td style={{ padding: "8px" }}>{v.value}</td>
      </tr>
    );
  };

  // if (loading) {
  //   return "Loading...";
  // }

  return (
    <div>
      <form
        style={{ display: "flex", gap: "8px", alignItems: "center" }}
        onSubmit={handleSubmit}
      >
        <span>https://</span>
        <input
          type="text"
          placeholder="Enter your domain"
          value={domain}
          onChange={(e) => setDomain(e.target.value)}
          disabled={!!currentDomain}
          style={{
            outline: "none",
            borderRadius: "8px",
            padding: "12px",
            border: "1px solid #ccc",
          }}
        />
        {currentDomain ? (
          <button
            style={{
              outline: "none",
              borderRadius: "8px",
              padding: "12px",
              border: "1px solid #ccc",
              background: "black",
              color: "white",
              cursor: "pointer",
            }}
            onClick={handleRemove}
            type="button"
          >
            Remove
          </button>
        ) : (
          <button
            style={{
              outline: "none",
              borderRadius: "8px",
              padding: "12px",
              background: "black",
              color: "white",
              cursor: "pointer",
              border: "1px solid #ccc",
            }}
          >
            Add
          </button>
        )}
      </form>

      <br />

      {loading ? null : (
        <>
          <div>
            {isVerified ? (
              <div>Connected</div>
            ) : currentDomain ? (
              <div>DNS configurations required</div>
            ) : null}
          </div>

          <br />

          {currentDomain && !isVerified ? (
            <div>
              {!verifications?.length ? (
                <div>
                  <p>
                    Set the following record on your DNS provider to continue:
                  </p>
                  <table>
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Name</th>
                        <th>Value</th>
                      </tr>
                    </thead>

                    <tbody>
                      <tr>
                        <td style={{ padding: "8px" }}>A</td>
                        <td style={{ padding: "8px" }}>@</td>
                        <td style={{ padding: "8px" }}>76.76.21.21</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <>
                  <h3>DNS Configuration</h3>
                  <p>
                    Please add the following records to your DNS configuration
                    to successfully deploy your documentation on the custom
                    domain.
                  </p>
                  <table>
                    <thead>
                      <tr>
                        <th>Type</th>
                        <th>Name</th>
                        <th>Value</th>
                      </tr>
                    </thead>

                    <tbody>
                      {verifications.map((v) => renderVerification(v))}
                    </tbody>
                  </table>
                </>
              )}
            </div>
          ) : null}
        </>
      )}

      {!currentDomain ? (
        <div>
          Your default domain is:{" "}
          <a href="https://test-custom-domain-blue.vercel.app" target="_blank">
            https://test-custom-domain-blue.vercel.app
          </a>
        </div>
      ) : isVerified ? (
        <div>
          Your custom domain is:{" "}
          <a href={`https://${currentDomain.name}`} target="_blank">
            {currentDomain.name}
          </a>
        </div>
      ) : null}
    </div>
  );
};

export default CustomDomainsPage;
