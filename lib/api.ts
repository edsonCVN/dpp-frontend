import axios from "axios";

// Default Cacti REST Api endpoint (now running on 3002 locally to avoid conflicts)
const CACTI_API_URL = process.env.NEXT_PUBLIC_CACTI_API_URL || "http://127.0.0.1:3002";

const apiClient = axios.create({
  baseURL: CACTI_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// --- DPP Plugin Endpoints Mapping ---

export interface CreateDPPPayload {
  owner: string;
  productionData?: any;
}

export const createDPP = async (payload: CreateDPPPayload) => {
  try {
    const response = await apiClient.post("/api/v1/@hyperledger/cactus-plugin-dpp/create", payload);
    return response.data;
  } catch (error) {
    console.error("Failed to create DPP:", error);
    throw error;
  }
};

export const fetchDPPData = async (dppId: string) => {
  try {
    // Backend uses GET /data?dppId=X
    const response = await apiClient.get(`/api/v1/@hyperledger/cactus-plugin-dpp/data`, {
        params: { dppId }
    });
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch DPP ${dppId}:`, error);
    throw error;
  }
};

export const fetchDPPHistory = async (dppId: string) => {
  try {
    const response = await apiClient.get(`/api/v1/@hyperledger/cactus-plugin-dpp/history/${dppId}`);
    return response.data;
  } catch (error) {
    console.error(`Failed to fetch DPP history ${dppId}:`, error);
    throw error;
  }
};

export const fetchConfig = async (): Promise<{ contractAddress: string; network: string; satpGateway?: string }> => {
  try {
    const response = await apiClient.get(`/api/v1/@hyperledger/cactus-plugin-dpp/config`);
    return response.data;
  } catch {
    return { contractAddress: "N/A", network: "Anvil Localnet" };
  }
};


export const getAllPassports = async () => {
    try {
      const response = await apiClient.get(`/api/v1/@hyperledger/cactus-plugin-dpp/passports`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch all DPPs:`, error);
      throw error;
    }
};

export const updateTransportData = async (payload: any) => {
    try {
      const response = await apiClient.post("/api/v1/@hyperledger/cactus-plugin-dpp/update-transport-data", payload);
      return response.data;
    } catch (error) {
      console.error("Failed to update transport:", error);
      throw error;
    }
};

export const submitProductReview = async (payload: any) => {
    try {
      const response = await apiClient.post("/api/v1/@hyperledger/cactus-plugin-dpp/submit-product-review", payload);
      return response.data;
    } catch (error) {
      console.error("Failed to submit review:", error);
      throw error;
    }
};

export const markAsReceived = async (payload: any) => {
    try {
      const response = await apiClient.post("/api/v1/@hyperledger/cactus-plugin-dpp/mark-as-received", payload);
      return response.data;
    } catch (error) {
      console.error("Failed to mark as received:", error);
      throw error;
    }
};

export const updateRetailData = async (payload: any) => {
    try {
      const response = await apiClient.post("/api/v1/@hyperledger/cactus-plugin-dpp/update-retail-data", payload);
      return response.data;
    } catch (error) {
      console.error("Failed to update retail data:", error);
      throw error;
    }
};

export const disaggregateDPP = async (payload: any) => {
    try {
      const response = await apiClient.post("/api/v1/@hyperledger/cactus-plugin-dpp/disaggregate", payload);
      return response.data;
    } catch (error) {
      console.error("Failed to disaggregate DPP:", error);
      throw error;
    }
};

export const aggregateDPPtoBox = async (payload: any) => {
    try {
      const response = await apiClient.post("/api/v1/@hyperledger/cactus-plugin-dpp/aggregate", payload);
      return response.data;
    } catch (error) {
      console.error("Failed to aggregate DPPs to Box:", error);
      throw error;
    }
};

export interface TransferDPPPayload {
  dppId: string;
  from: string;
  to: string;
}

export const transferDPP = async (payload: TransferDPPPayload) => {
  try {
    const response = await apiClient.post("/api/v1/@hyperledger/cactus-plugin-dpp/transfer", payload);
    return response.data;
  } catch (error) {
    console.error("Failed to transfer DPP:", error);
    throw error;
  }
};

export const amendDPPData = async (payload: any) => {
  try {
    const response = await apiClient.post("/api/v1/@hyperledger/cactus-plugin-dpp/amend", payload);
    return response.data;
  } catch (error) {
    console.error("Failed to amend DPP data:", error);
    throw error;
  }
};

export const addCertification = async (payload: any) => {
  try {
    const response = await apiClient.post("/api/v1/@hyperledger/cactus-plugin-dpp/add-certification", payload);
    return response.data;
  } catch (error) {
    console.error("Failed to add certification:", error);
    throw error;
  }
};

export interface CrossChainTransferPayload {
  dppId: string | number;
  receiverAddress?: string;
  sourceOwner?: string;
}

/**
 * Initiate a SATP cross-chain transfer via the API gateway (proxied to SATP Hermes gateway-1).
 * Returns { sessionId } which can be polled with getCrossChainStatus.
 */
export const crossChainTransferDPP = async (payload: CrossChainTransferPayload) => {
  try {
    const response = await apiClient.post(
      "/api/v1/@hyperledger/cactus-plugin-dpp/cross-chain-transfer",
      payload,
    );
    return response.data as { sessionId: string; raw: any };
  } catch (error) {
    console.error("Failed to initiate cross-chain transfer:", error);
    throw error;
  }
};

/**
 * Poll the SATP session status for a running cross-chain transfer.
 * Returns { status, phase, ... } from SATP Hermes gateway-1.
 */
export const getCrossChainStatus = async (sessionId: string) => {
  try {
    const response = await apiClient.get(
      "/api/v1/@hyperledger/cactus-plugin-dpp/cross-chain-status",
      { params: { sessionId } },
    );
    return response.data;
  } catch (error: any) {
    // 400/404 are expected during early polling (session still initialising) — suppress noise
    const status = error?.response?.status;
    if (status !== 400 && status !== 404) {
      console.error("Failed to get cross-chain status:", error);
    }
    throw error;
  }
};

export const fetchAuditReport = async () => {
    try {
      const response = await apiClient.get("/api/v1/@hyperledger/cactus-plugin-dpp/audit");
      return response.data;
    } catch (error) {
      console.error("Failed to fetch audit report:", error);
      throw error;
    }
};

// Add more wrappers as needed to match your DigitalProductPassport role functions.
export default apiClient;

