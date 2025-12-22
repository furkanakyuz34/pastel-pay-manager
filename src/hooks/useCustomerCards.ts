import { useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { CustomerCard } from "@/types";
import { customerCardService } from "@/services/cardService";
import {
  setCards,
  addCard,
  updateCard,
  deleteCard,
  setDefaultCard,
  setLoading,
  setError,
  clearError,
} from "@/features/customerCardSlice";
import { RootState } from "@/store/store";
import { useToast } from "./use-toast";

/**
 * Hook for managing customer cards
 * Provides card CRUD operations and Redux state management
 */
export function useCustomerCards(customerId?: string) {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const { cards, loading, error, selectedCardId } = useSelector(
    (state: RootState) => state.customerCards
  );

  const [isOperating, setIsOperating] = useState(false);

  /**
   * Fetch all cards for a customer
   */
  const fetchCards = useCallback(async (cId: string) => {
    if (!cId) return;
    dispatch(setLoading(true));
    try {
      const fetchedCards = await customerCardService.getCustomerCards(cId);
      dispatch(setCards(fetchedCards));
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Kartlar yüklenirken hata oluştu";
      dispatch(setError(errorMessage));
      toast({
        title: "Hata",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, toast]);

  /**
   * Add a new card
   */
  const addNewCard = useCallback(
    async (cId: string, cardData: Omit<CustomerCard, "id" | "createdAt" | "updatedAt">) => {
      setIsOperating(true);
      try {
        const newCard = await customerCardService.addCard(cId, cardData);
        dispatch(addCard(newCard));
        toast({
          title: "Başarılı",
          description: "Kart başarıyla eklendi",
        });
        return newCard;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Kart eklenirken hata oluştu";
        dispatch(setError(errorMessage));
        toast({
          title: "Hata",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsOperating(false);
      }
    },
    [dispatch, toast]
  );

  /**
   * Update an existing card
   */
  const updateExistingCard = useCallback(
    async (cId: string, cardId: string, updates: Partial<CustomerCard>) => {
      setIsOperating(true);
      try {
        const updatedCard = await customerCardService.updateCard(
          cId,
          cardId,
          updates
        );
        dispatch(updateCard(updatedCard));
        toast({
          title: "Başarılı",
          description: "Kart güncelleştirildi",
        });
        return updatedCard;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Kart güncellenirken hata oluştu";
        dispatch(setError(errorMessage));
        toast({
          title: "Hata",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsOperating(false);
      }
    },
    [dispatch, toast]
  );

  /**
   * Delete a card
   */
  const removeCard = useCallback(
    async (cId: string, cardId: string) => {
      setIsOperating(true);
      try {
        await customerCardService.deleteCard(cId, cardId);
        dispatch(deleteCard(cardId));
        toast({
          title: "Başarılı",
          description: "Kart silindi",
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Kart silinirken hata oluştu";
        dispatch(setError(errorMessage));
        toast({
          title: "Hata",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsOperating(false);
      }
    },
    [dispatch, toast]
  );

  /**
   * Set a card as default
   */
  const setAsDefault = useCallback(
    async (cId: string, cardId: string) => {
      setIsOperating(true);
      try {
        await customerCardService.setDefaultCard(cId, cardId);
        dispatch(setDefaultCard(cardId));
        toast({
          title: "Başarılı",
          description: "Varsayılan kart güncellendi",
        });
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Varsayılan kart ayarlanırken hata oluştu";
        dispatch(setError(errorMessage));
        toast({
          title: "Hata",
          description: errorMessage,
          variant: "destructive",
        });
      } finally {
        setIsOperating(false);
      }
    },
    [dispatch, toast]
  );

  /**
   * Validate card with payment provider
   */
  const validateCardWithProvider = useCallback(
    async (
      cId: string,
      cardData: {
        cardNumber: string;
        expiryMonth: number;
        expiryYear: number;
        cvv: string;
      }
    ) => {
      setIsOperating(true);
      try {
        const result = await customerCardService.validateCard(cId, cardData);
        if (!result.valid) {
          toast({
            title: "Hata",
            description: result.message || "Kart doğrulanması başarısız",
            variant: "destructive",
          });
        }
        return result;
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Kart doğrulanırken hata oluştu";
        dispatch(setError(errorMessage));
        toast({
          title: "Hata",
          description: errorMessage,
          variant: "destructive",
        });
        return { valid: false };
      } finally {
        setIsOperating(false);
      }
    },
    [dispatch, toast]
  );

  /**
   * Get default card
   */
  const getDefaultCard = useCallback(() => {
    return cards.find((card) => card.isDefault);
  }, [cards]);

  /**
   * Get active cards
   */
  const getActiveCards = useCallback(() => {
    return cards.filter((card) => card.isActive);
  }, [cards]);

  /**
   * Check if card is expired
   */
  const isCardExpired = useCallback((card: CustomerCard) => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth() + 1;
    return card.expiryYear < currentYear || (card.expiryYear === currentYear && card.expiryMonth < currentMonth);
  }, []);

  return {
    cards,
    loading,
    error,
    selectedCardId,
    isOperating,
    fetchCards,
    addNewCard,
    updateExistingCard,
    removeCard,
    setAsDefault,
    validateCardWithProvider,
    getDefaultCard,
    getActiveCards,
    isCardExpired,
    clearError: () => dispatch(clearError()),
  };
}

export default useCustomerCards;
