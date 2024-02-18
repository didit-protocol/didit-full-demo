import { create } from "zustand";

interface VerificationModalStore {
  isOpen: boolean;
  onOpen: () => void;
  onClose: () => void;
}

const useVerificationModal = create<VerificationModalStore>((set) => ({
  isOpen: false,
  onOpen: () => set({ isOpen: true }),
  onClose: () => set({ isOpen: false }),
}));

export default useVerificationModal;
