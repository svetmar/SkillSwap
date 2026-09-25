import type { SwapRequest } from '@/shared/types';
import { assetUrl } from '@/shared/lib/helpers'

const BASE_URL = assetUrl('/db');

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
