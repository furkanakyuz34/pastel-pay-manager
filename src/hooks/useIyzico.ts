/**
 * Custom hooks for iyzico subscription operations
 */

import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  IyzCoSubscriptionService,
  CreateSubscriptionRequest,
  CreateSubscriptionWithCustomerRequest,
  CreateSubscriptionResponse,
  ActivateSubscriptionResponse,
  CancelSubscriptionResponse,
  SearchSubscriptionResponse,
  GetSubscriptionDetailResponse,
  UpdateCardRequest,
  IyzCoConfig,
  createIyzCoService,
} from "@/services/iyzico";

interface UseIyzCoSubscriptionState {
  loading: boolean;
  error: string | null;
  success: boolean;
}

/**
 * Hook for managing iyzico subscription service
 */
export function useIyzCoService(config: IyzCoConfig) {
  const service = createIyzCoService(config);
  return service;
}

/**
 * Hook for creating a new subscription
 */
export function useCreateSubscription(config: IyzCoConfig) {
  const [state, setState] = useState<UseIyzCoSubscriptionState>({
    loading: false,
    error: null,
    success: false,
  });
  const { toast } = useToast();
  const service = useIyzCoService(config);

  const createSubscription = useCallback(
    async (request: CreateSubscriptionRequest) => {
      setState({ loading: true, error: null, success: false });
      try {
        const response = await service.createSubscription(request);

        if (response.status === "success" && response.data) {
          setState({ loading: false, error: null, success: true });
          toast({
            title: "Abonelik Oluşturuldu",
            description: `Abonelik başarıyla oluşturuldu. Ref: ${response.data.referenceCode}`,
          });
          return response.data;
        } else {
          const error = response.errorMessage || "Abonelik oluşturulamadı";
          setState({ loading: false, error, success: false });
          toast({
            title: "Hata",
            description: error,
            variant: "destructive",
          });
          return null;
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Bilinmeyen bir hata oluştu";
        setState({ loading: false, error: errorMessage, success: false });
        toast({
          title: "Hata",
          description: errorMessage,
          variant: "destructive",
        });
        return null;
      }
    },
    [service, toast]
  );

  return { ...state, createSubscription };
}

/**
 * Hook for creating subscription with existing customer
 */
export function useCreateSubscriptionWithCustomer(config: IyzCoConfig) {
  const [state, setState] = useState<UseIyzCoSubscriptionState>({
    loading: false,
    error: null,
    success: false,
  });
  const { toast } = useToast();
  const service = useIyzCoService(config);

  const createSubscription = useCallback(
    async (request: CreateSubscriptionWithCustomerRequest) => {
      setState({ loading: true, error: null, success: false });
      try {
        const response = await service.createSubscriptionWithCustomer(request);

        if (response.status === "success" && response.data) {
          setState({ loading: false, error: null, success: true });
          toast({
            title: "Abonelik Oluşturuldu",
            description: `Müşteri aboneliği başarıyla oluşturuldu.`,
          });
          return response.data;
        } else {
          const error = response.errorMessage || "Abonelik oluşturulamadı";
          setState({ loading: false, error, success: false });
          toast({
            title: "Hata",
            description: error,
            variant: "destructive",
          });
          return null;
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Bilinmeyen bir hata oluştu";
        setState({ loading: false, error: errorMessage, success: false });
        toast({
          title: "Hata",
          description: errorMessage,
          variant: "destructive",
        });
        return null;
      }
    },
    [service, toast]
  );

  return { ...state, createSubscription };
}

/**
 * Hook for activating a pending subscription
 */
export function useActivateSubscription(config: IyzCoConfig) {
  const [state, setState] = useState<UseIyzCoSubscriptionState>({
    loading: false,
    error: null,
    success: false,
  });
  const { toast } = useToast();
  const service = useIyzCoService(config);

  const activate = useCallback(
    async (subscriptionReferenceCode: string) => {
      setState({ loading: true, error: null, success: false });
      try {
        const response = await service.activateSubscription(
          subscriptionReferenceCode
        );

        if (response.status === "success") {
          setState({ loading: false, error: null, success: true });
          toast({
            title: "Abonelik Aktifleştirildi",
            description: "Abonelik başarıyla aktifleştirildi.",
          });
          return true;
        } else {
          const error = response.errorMessage || "Aktifleştirme başarısız";
          setState({ loading: false, error, success: false });
          toast({
            title: "Hata",
            description: error,
            variant: "destructive",
          });
          return false;
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Bilinmeyen bir hata oluştu";
        setState({ loading: false, error: errorMessage, success: false });
        toast({
          title: "Hata",
          description: errorMessage,
          variant: "destructive",
        });
        return false;
      }
    },
    [service, toast]
  );

  return { ...state, activate };
}

/**
 * Hook for cancelling a subscription
 */
export function useCancelSubscription(config: IyzCoConfig) {
  const [state, setState] = useState<UseIyzCoSubscriptionState>({
    loading: false,
    error: null,
    success: false,
  });
  const { toast } = useToast();
  const service = useIyzCoService(config);

  const cancel = useCallback(
    async (subscriptionReferenceCode: string) => {
      setState({ loading: true, error: null, success: false });
      try {
        const response = await service.cancelSubscription(
          subscriptionReferenceCode
        );

        if (response.status === "success") {
          setState({ loading: false, error: null, success: true });
          toast({
            title: "Abonelik İptal Edildi",
            description: "Abonelik başarıyla iptal edildi.",
          });
          return true;
        } else {
          const error = response.errorMessage || "İptal işlemi başarısız";
          setState({ loading: false, error, success: false });
          toast({
            title: "Hata",
            description: error,
            variant: "destructive",
          });
          return false;
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Bilinmeyen bir hata oluştu";
        setState({ loading: false, error: errorMessage, success: false });
        toast({
          title: "Hata",
          description: errorMessage,
          variant: "destructive",
        });
        return false;
      }
    },
    [service, toast]
  );

  return { ...state, cancel };
}

/**
 * Hook for fetching subscription details
 */
export function useGetSubscriptionDetail(config: IyzCoConfig) {
  const [state, setState] = useState<
    UseIyzCoSubscriptionState & {
      data: any | null;
    }
  >({
    loading: false,
    error: null,
    success: false,
    data: null,
  });
  const service = useIyzCoService(config);

  const fetch = useCallback(
    async (subscriptionReferenceCode: string) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await service.getSubscriptionDetail(
          subscriptionReferenceCode
        );

        if (response.status === "success" && response.data) {
          setState({ loading: false, error: null, success: true, data: response.data });
          return response.data;
        } else {
          const error = response.errorMessage || "Abonelik bilgisi alınamadı";
          setState((prev) => ({
            ...prev,
            loading: false,
            error,
            success: false,
            data: null,
          }));
          return null;
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Bilinmeyen bir hata oluştu";
        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
          success: false,
          data: null,
        }));
        return null;
      }
    },
    [service]
  );

  return { ...state, fetch };
}

/**
 * Hook for searching subscriptions
 */
export function useSearchSubscriptions(config: IyzCoConfig) {
  const [state, setState] = useState<
    UseIyzCoSubscriptionState & {
      data: any[] | null;
    }
  >({
    loading: false,
    error: null,
    success: false,
    data: null,
  });
  const service = useIyzCoService(config);

  const search = useCallback(
    async (
      subscriptionReferenceCode?: string,
      customerReferenceCode?: string,
      limit?: number,
      offset?: number
    ) => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await service.searchSubscriptions({
          subscriptionReferenceCode,
          customerReferenceCode,
          limit,
          offset,
        });

        if (response.status === "success" && response.data) {
          setState({ loading: false, error: null, success: true, data: response.data });
          return response.data;
        } else {
          const error = response.errorMessage || "Abonelik arama başarısız";
          setState((prev) => ({
            ...prev,
            loading: false,
            error,
            success: false,
            data: null,
          }));
          return null;
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Bilinmeyen bir hata oluştu";
        setState((prev) => ({
          ...prev,
          loading: false,
          error: errorMessage,
          success: false,
          data: null,
        }));
        return null;
      }
    },
    [service]
  );

  return { ...state, search };
}

/**
 * Hook for updating subscription card
 */
export function useUpdateSubscriptionCard(config: IyzCoConfig) {
  const [state, setState] = useState<UseIyzCoSubscriptionState>({
    loading: false,
    error: null,
    success: false,
  });
  const { toast } = useToast();
  const service = useIyzCoService(config);

  const updateCard = useCallback(
    async (request: UpdateCardRequest) => {
      setState({ loading: true, error: null, success: false });
      try {
        const response = await service.updateSubscriptionCard(request);

        if (response.status === "success") {
          setState({ loading: false, error: null, success: true });
          toast({
            title: "Kart Güncellendi",
            description: "Kart bilgileri başarıyla güncellendi.",
          });
          return true;
        } else {
          const error = response.errorMessage || "Kart güncellenemedi";
          setState({ loading: false, error, success: false });
          toast({
            title: "Hata",
            description: error,
            variant: "destructive",
          });
          return false;
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Bilinmeyen bir hata oluştu";
        setState({ loading: false, error: errorMessage, success: false });
        toast({
          title: "Hata",
          description: errorMessage,
          variant: "destructive",
        });
        return false;
      }
    },
    [service, toast]
  );

  return { ...state, updateCard };
}
