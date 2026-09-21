import axios, { type AxiosError } from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000/api/v1';

export const api = axios.create({
  baseURL,
  headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
  timeout: 10000,
});

export interface NormalizedApiError {
  message: string;
  fieldErrors: Record<string, string[]> | null;
  status: number | null;
}

interface ApiErrorBody {
  message?: string;
  errors?: Record<string, string[]>;
}

export function normalizeApiError(error: unknown): NormalizedApiError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorBody>;

    if (!axiosError.response) {
      return {
        message: 'Não foi possível conectar à API. Verifique sua conexão e tente novamente.',
        fieldErrors: null,
        status: null,
      };
    }

    const { status, data } = axiosError.response;
    return {
      message: data?.message ?? 'Ocorreu um erro inesperado ao comunicar com a API.',
      fieldErrors: data?.errors ?? null,
      status,
    };
  }

  return { message: 'Ocorreu um erro inesperado.', fieldErrors: null, status: null };
}