import {create} from 'zustand';

const useDropdown = create((set) => ({
    isOpen: false,
    toggleOpen:(newValue) => set((state) => ({ isOpen: newValue })),
}));

export default useDropdown;