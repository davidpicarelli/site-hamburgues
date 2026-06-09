import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;

export const apiClient = axios.create({
  baseURL: API,
  headers: { "Content-Type": "application/json" },
});

export async function listBacenSeries() {
  const { data } = await apiClient.get("/bacen/series");
  return data.series || [];
}

export async function fetchBacen(seriesCode, startDate, endDate) {
  const { data } = await apiClient.post("/bacen/fetch", {
    series_code: seriesCode,
    start_date: startDate,
    end_date: endDate,
  });
  return data;
}

export async function calculate(payload) {
  const { data } = await apiClient.post("/calculate", payload);
  return data;
}

export async function downloadReport(kind, result) {
  const url = `${API}/report/${kind}`;
  const response = await axios.post(url, result, { responseType: "blob" });
  const blob = new Blob([response.data], {
    type: kind === "excel"
      ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      : "application/pdf",
  });
  const link = document.createElement("a");
  const objectUrl = URL.createObjectURL(blob);
  link.href = objectUrl;
  link.download = kind === "excel" ? "laudo_pericial.xlsx" : "laudo_pericial.pdf";
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(objectUrl);
}
