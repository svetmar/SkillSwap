import type { SwapRequest } from '@/shared/types';

const BASE_URL = `${import.meta.env.BASE_URL}db`;

export interface ExchangeRequest extends SwapRequest {
  fromUserName: string;
  toUserName: string;
  skillTitle: string;
  notificationIsRead?: boolean;
}

export async function fetchRequests(): Promise<ExchangeRequest[]> {
  const response = await fetch(`${BASE_URL}/requests.json`);
  if (!response.ok) throw new Error('Failed to fetch requests');
  return response.json();
}

export async function saveRequest(request: ExchangeRequest): Promise<ExchangeRequest> {
  return request;
}
