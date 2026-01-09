import { useGetDovizKuruQuery } from "@/services/backendApi";

export interface DovizKurlari {
  USD: number;
  EUR: number;
  isLoading: boolean;
  error: boolean;
}

export function useDovizKuru(): DovizKurlari {
  const { data: usdKuru, isLoading: usdLoading, isError: usdError } = useGetDovizKuruQuery('USD');
  const { data: eurKuru, isLoading: eurLoading, isError: eurError } = useGetDovizKuruQuery('EURO');

  return {
    USD: usdKuru || 0,
    EUR: eurKuru || 0,
    isLoading: usdLoading || eurLoading,
    error: usdError || eurError,
  };
}

export function formatDoviz(amount: number, dovizId?: string): string {
  const currency = dovizId === 'USD' ? 'USD' : (dovizId === 'EURO' || dovizId === 'EUR') ? 'EUR' : 'TRY';
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
  }).format(amount);
}

export function convertToTL(amount: number, dovizId: string | undefined, kurlar: DovizKurlari): number {
  if (!dovizId || dovizId === 'TL' || dovizId === 'TRY') return amount;
  if (dovizId === 'USD') return amount * kurlar.USD;
  if (dovizId === 'EURO' || dovizId === 'EUR') return amount * kurlar.EUR;
  return amount;
}

export function convertFromTL(amountTL: number, dovizId: string | undefined, kurlar: DovizKurlari): number {
  if (!dovizId || dovizId === 'TL' || dovizId === 'TRY') return amountTL;
  if (dovizId === 'USD' && kurlar.USD > 0) return amountTL / kurlar.USD;
  if ((dovizId === 'EURO' || dovizId === 'EUR') && kurlar.EUR > 0) return amountTL / kurlar.EUR;
  return amountTL;
}
