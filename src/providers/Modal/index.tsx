// context/ModalContext.tsx
'use client';
import React, { createContext, useContext, useState, ReactNode } from 'react';

type ModalType = string;

type ModalProps = Record<string, any>;

type ModalContextType = {
  modalType: ModalType;
  modalProps: ModalProps;
  openModal: (type: ModalType, props?: ModalProps) => void;
  closeModal: () => void;
};

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) throw new Error('useModal must be used within ModalProvider');
  return context;
};

export const ModalProvider = ({ children }: { children: ReactNode }) => {
  const [modalType, setModalType] = useState<ModalType>('');
  const [modalProps, setModalProps] = useState<ModalProps>({});

  const openModal = (type: ModalType, props: ModalProps = {}) => {
    setModalType(type);
    setModalProps(props);
  };

  const closeModal = () => {
    setModalType('');
    setModalProps({});
  };

  return (
    <ModalContext.Provider value={{ modalType, modalProps, openModal, closeModal }}>
      {children}
    </ModalContext.Provider>
  );
};
